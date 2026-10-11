import Submission from '../models/Submission.js';
import { asyncHandler } from '../utils/helpers.js';

// POST /api/submissions — "Maqola yuborish" form
export const createSubmission = asyncHandler(async (req, res) => {
  const { fullName, email, title } = req.body;
  if (!fullName || !email || !title) {
    res.status(400);
    throw new Error('F.I.Sh., e-mail va maqola sarlavhasi majburiy');
  }
  const submission = await Submission.create(req.body);
  res.status(201).json({
    message: 'Maqolangiz qabul qilindi. Tahririyat siz bilan bogʻlanadi.',
    id: submission._id
  });
});

export const adminListSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find().sort({ createdAt: -1 }).limit(200).lean();
  res.json({ submissions });
});

export const updateSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  if (!submission) {
    res.status(404);
    throw new Error('Ariza topilmadi');
  }
  res.json(submission);
});

export const deleteSubmission = asyncHandler(async (req, res) => {
  const submission = await Submission.findByIdAndDelete(req.params.id);
  if (!submission) {
    res.status(404);
    throw new Error('Ariza topilmadi');
  }
  res.json({ message: 'Ariza ochirildi', id: req.params.id });
});
