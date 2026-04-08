const express   = require('express');
const router    = express.Router();
const multer    = require('multer');
const path      = require('path');
const fs        = require('fs');
const axios     = require('axios');
const FormData  = require('form-data');
const { spawn } = require('child_process');
const protect   = require('../middleware/authMiddleware');
const Scan      = require('../models/Scan');

// ── Multer ────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const fileFilter = (req, file, cb) => {
  ['image/jpeg','image/jpg','image/png','image/webp'].includes(file.mimetype)
    ? cb(null, true) : cb(new Error('Only image files allowed'), false);
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

const isProduction = process.env.NODE_ENV === 'production';

// ── Call ML via HTTP (production) ─────────────────────────────
async function callMLServiceHTTP(imagePath) {
  const mlUrl = process.env.ML_SERVICE_URL;
  if (!mlUrl) throw new Error('ML_SERVICE_URL not set');

  // Wake up ML service first (free tier sleeps)
  try {
    await axios.get(`${mlUrl}/health`, { timeout: 60000 });
  } catch(e) {
    console.log('ML service waking up...');
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(imagePath), path.basename(imagePath));

  const response = await axios.post(`${mlUrl}/predict`, formData, {
    headers: { ...formData.getHeaders() },
    timeout: 120000, // 2 min timeout for cold start
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  return response.data;
}

// ── Call ML via Python spawn (local) ──────────────────────────
function callMLServiceLocal(imagePath) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', '..', 'ml_service', 'standalone_predict.py');
    const pythonExe  = process.env.PYTHON_PATH || 'python';
    const py = spawn(pythonExe, [scriptPath, imagePath]);
    let out = '', err = '';
    py.stdout.on('data', d => { out += d.toString(); });
    py.stderr.on('data', d => { err += d.toString(); });
    py.on('close', code => {
      console.log('Python exit:', code, 'output:', out);
      if (err) console.log('stderr:', err);
      try {
        const jsonLine = out.trim().split('\n').find(l => l.trim().startsWith('{'));
        if (!jsonLine) return reject(new Error('No JSON from Python: ' + out + err));
        const result = JSON.parse(jsonLine);
        if (result.error) return reject(new Error(result.error));
        resolve(result);
      } catch(e) {
        reject(new Error('JSON parse failed: ' + out));
      }
    });
    py.on('error', e => reject(new Error('Cannot start Python: ' + e.message)));
  });
}

// ── POST /api/scans/predict ───────────────────────────────────
router.post('/predict', protect, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  try {
    let result;

    if (isProduction) {
      result = await callMLServiceHTTP(req.file.path);
    } else {
      result = await callMLServiceLocal(req.file.path);

      // Local: copy annotated image to uploads folder
      if (result.annotated_image) {
        const uploadsDir      = path.join(__dirname, '..', 'uploads');
        const annotatedFilename = `annotated_${path.basename(result.annotated_image)}`;
        const destPath        = path.join(uploadsDir, annotatedFilename);
        const normalizedSrc   = result.annotated_image.replace(/\\/g, path.sep);
        if (fs.existsSync(normalizedSrc)) {
          fs.copyFileSync(normalizedSrc, destPath);
        }
        result.annotated_image = annotatedFilename;
      }
    }

    const { grade_a, grade_b, final_grade, annotated_image } = result;

    // Save to MongoDB — store base64 or filename depending on env
    const scan = await Scan.create({
      filename:       req.file.originalname,
      annotatedImage: annotated_image, // base64 in prod, filename in local
      gradeA:         grade_a,
      gradeB:         grade_b,
      totalCount:     grade_a + grade_b,
      finalGrade:     final_grade,
      user:           req.user._id,
    });

    res.json({
      success:        true,
      gradeA:         grade_a,
      gradeB:         grade_b,
      totalCount:     grade_a + grade_b,
      finalGrade:     final_grade,
      annotatedImage: annotated_image, // base64 string in prod
      isBase64:       isProduction,
      scanId:         scan._id,
    });

  } catch (err) {
    console.error('Predict error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/scans/history ────────────────────────────────────
router.get('/history', protect, async (req, res) => {
  try {
    const scans = await Scan.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('filename finalGrade gradeA gradeB totalCount createdAt annotatedImage');
    res.json(scans);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const scan = await Scan.findOne({ _id: req.params.id, user: req.user._id });
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    res.json(scan);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scan' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const scan = await Scan.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!scan) return res.status(404).json({ error: 'Scan not found' });
    res.json({ message: 'Scan deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete scan' });
  }
});

module.exports = router;
