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

// ── Check if running in production ───────────────────────────
const isProduction = process.env.NODE_ENV === 'production';

// ── Call ML via HTTP (production) ─────────────────────────────
async function callMLServiceHTTP(imagePath) {
  const mlUrl = process.env.ML_SERVICE_URL;
  if (!mlUrl) throw new Error('ML_SERVICE_URL not set in environment variables');

  const formData = new FormData();
  formData.append('file', fs.createReadStream(imagePath), path.basename(imagePath));

  const response = await axios.post(`${mlUrl}/predict`, formData, {
    headers: { ...formData.getHeaders() },
    timeout: 60000,
  });

  return response.data;
}

// ── Call ML via Python spawn (local development) ──────────────
function callMLServiceLocal(imagePath) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', '..', 'ml_service', 'standalone_predict.py');
    const pythonExe  = process.env.PYTHON_PATH || 'python';

    console.log('Running Python:', pythonExe, scriptPath);

    const py = spawn(pythonExe, [scriptPath, imagePath]);
    let out = '', err = '';

    py.stdout.on('data', d => { out += d.toString(); });
    py.stderr.on('data', d => { err += d.toString(); });

    py.on('close', code => {
      console.log('Python exit code:', code);
      console.log('Python output:', out);
      if (err) console.log('Python stderr:', err);

      try {
        const jsonLine = out.trim().split('\n').find(l => l.trim().startsWith('{'));
        if (!jsonLine) return reject(new Error('No JSON from Python. Output: ' + out + ' | Errors: ' + err));
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
    let annotatedFilename;

    if (isProduction) {
      // ── PRODUCTION: call deployed ML service via HTTP ──
      result = await callMLServiceHTTP(req.file.path);
      const { grade_a, grade_b, final_grade, annotated_image } = result;
      annotatedFilename = annotated_image; // ML service returns just filename in prod

      const scan = await Scan.create({
        filename:       req.file.originalname,
        annotatedImage: annotatedFilename,
        gradeA:         grade_a,
        gradeB:         grade_b,
        totalCount:     grade_a + grade_b,
        finalGrade:     final_grade,
        user:           req.user._id,
      });

      return res.json({
        success:        true,
        gradeA:         grade_a,
        gradeB:         grade_b,
        totalCount:     grade_a + grade_b,
        finalGrade:     final_grade,
        annotatedImage: `${process.env.ML_SERVICE_URL}/annotated/${annotatedFilename}`,
        scanId:         scan._id,
      });

    } else {
      // ── LOCAL: spawn Python directly ──
      result = await callMLServiceLocal(req.file.path);
      const { grade_a, grade_b, final_grade, annotated_image } = result;

      // Copy annotated image to server/uploads
      const uploadsDir    = path.join(__dirname, '..', 'uploads');
      annotatedFilename   = `annotated_${path.basename(annotated_image)}`;
      const destPath      = path.join(uploadsDir, annotatedFilename);
      const normalizedSrc = annotated_image.replace(/\\/g, path.sep);

      if (fs.existsSync(normalizedSrc)) {
        fs.copyFileSync(normalizedSrc, destPath);
        console.log('Copied annotated image to:', destPath);
      } else {
        console.log('WARNING: annotated image not found at:', normalizedSrc);
      }

      const scan = await Scan.create({
        filename:       req.file.originalname,
        annotatedImage: annotatedFilename,
        gradeA:         grade_a,
        gradeB:         grade_b,
        totalCount:     grade_a + grade_b,
        finalGrade:     final_grade,
        user:           req.user._id,
      });

      return res.json({
        success:        true,
        gradeA:         grade_a,
        gradeB:         grade_b,
        totalCount:     grade_a + grade_b,
        finalGrade:     final_grade,
        annotatedImage: annotatedFilename,
        scanId:         scan._id,
      });
    }

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
