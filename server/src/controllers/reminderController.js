const MedicineReminder = require('../models/MedicineReminder');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Create a new medicine reminder
// @route   POST /api/reminders
// @access  Private (CUSTOMER)
const createReminder = async (req, res, next) => {
  try {
    const { medicineName, medicineId, dosage, frequency, timings, startDate, endDate, daysOfWeek, notes, notificationPreference } = req.body;

    if (!medicineName || !dosage || !frequency || !timings || timings.length === 0) {
      throw ApiError.badRequest('Medicine name, dosage, frequency, and at least one timing are required.');
    }

    if (timings.length !== frequency) {
      throw ApiError.badRequest(`You selected ${frequency} times/day but provided ${timings.length} time slots. They must match.`);
    }

    const reminder = await MedicineReminder.create({
      userId: req.user._id,
      medicineName,
      medicineId: medicineId || null,
      dosage,
      frequency,
      timings,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      daysOfWeek: daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
      notes: notes || '',
      notificationPreference: notificationPreference || { browser: true, inApp: true }
    });

    return ApiResponse.created(res, { reminder }, 'Medicine reminder created successfully!');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reminders for the logged-in user
// @route   GET /api/reminders
// @access  Private (CUSTOMER)
const getMyReminders = async (req, res, next) => {
  try {
    const reminders = await MedicineReminder.find({ userId: req.user._id })
      .sort({ isActive: -1, createdAt: -1 })
      .populate('medicineId', 'name image brand');

    // Build today's schedule
    const now = new Date();
    const currentDay = now.getDay();
    const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const todaySchedule = [];
    for (const reminder of reminders) {
      if (!reminder.isActive) continue;
      if (!reminder.daysOfWeek.includes(currentDay)) continue;
      if (reminder.endDate && now > reminder.endDate) continue;
      if (now < new Date(reminder.startDate)) continue;

      for (const timing of reminder.timings) {
        todaySchedule.push({
          reminderId: reminder._id,
          medicineName: reminder.medicineName,
          dosage: reminder.dosage,
          time: timing.time,
          label: timing.label,
          taken: timing.time < currentTimeStr,
          medicineImage: reminder.medicineId?.image || null
        });
      }
    }

    todaySchedule.sort((a, b) => a.time.localeCompare(b.time));

    return ApiResponse.success(res, { reminders, todaySchedule }, 'Reminders fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update a reminder
// @route   PUT /api/reminders/:id
// @access  Private (CUSTOMER)
const updateReminder = async (req, res, next) => {
  try {
    const reminder = await MedicineReminder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!reminder) {
      throw ApiError.notFound('Reminder not found.');
    }

    const allowedFields = ['medicineName', 'medicineId', 'dosage', 'frequency', 'timings', 'startDate', 'endDate', 'daysOfWeek', 'notes', 'notificationPreference', 'isActive'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        reminder[field] = req.body[field];
      }
    }

    await reminder.save();

    return ApiResponse.success(res, { reminder }, 'Reminder updated successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle reminder active/inactive
// @route   PATCH /api/reminders/:id/toggle
// @access  Private (CUSTOMER)
const toggleReminder = async (req, res, next) => {
  try {
    const reminder = await MedicineReminder.findOne({ _id: req.params.id, userId: req.user._id });
    if (!reminder) {
      throw ApiError.notFound('Reminder not found.');
    }

    reminder.isActive = !reminder.isActive;
    await reminder.save();

    return ApiResponse.success(
      res,
      { reminder },
      `Reminder ${reminder.isActive ? 'activated' : 'paused'} successfully.`
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
// @access  Private (CUSTOMER)
const deleteReminder = async (req, res, next) => {
  try {
    const reminder = await MedicineReminder.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!reminder) {
      throw ApiError.notFound('Reminder not found.');
    }

    return ApiResponse.success(res, null, 'Reminder deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReminder,
  getMyReminders,
  updateReminder,
  toggleReminder,
  deleteReminder
};
