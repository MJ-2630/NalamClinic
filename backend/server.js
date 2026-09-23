const express = require("express");
const cors = require("cors");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../frontend")));

const db = new Database(path.join(__dirname, "nalamcare.db"));

/* =========================
   DATABASE TABLES
========================= */
db.prepare(`
  CREATE TABLE IF NOT EXISTS appointment(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  doctor_id INTEGER NOT NULL,
  appointment_date TEXT NOT NULL,
  appointment_time TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP)
  `).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    review TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

app.post("/api/reviews", (req, res) => {

    const {
        patient_id,
        doctor_id,
        rating,
        review
    } = req.body;

    if (!patient_id || !doctor_id || !rating) {
        return res.status(400).json({
            message: "Patient, doctor and rating are required!"
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            message: "Rating must be between 1 and 5!"
        });
    }

    try {

        const result = db.prepare(`
            INSERT INTO reviews
            (
                patient_id,
                doctor_id,
                rating,
                review
            )
            VALUES (?, ?, ?, ?)
        `).run(
            patient_id,
            doctor_id,
            rating,
            review || ""
        );

        res.json({
            message: "Review submitted successfully!",
            id: result.lastInsertRowid
        });

    } catch (error) {

        console.error("Create review error:", error);

        res.status(500).json({
            message: "Failed to submit review!"
        });

    }

});
app.get("/api/doctors/:id/rating", (req, res) => {

    const doctorId = req.params.id;

    try {

        const result = db.prepare(`
            SELECT
                ROUND(AVG(rating), 1) AS rating,
                COUNT(*) AS review_count
            FROM reviews
            WHERE doctor_id = ?
        `).get(doctorId);

        res.json({
            rating: result.rating || 0,
            review_count: result.review_count || 0
        });

    } catch (error) {

        console.error("Get doctor rating error:", error);

        res.status(500).json({
            message: "Failed to load doctor rating!"
        });

    }

});

db.prepare(`
  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    dob TEXT,
    gender TEXT,
    password TEXT NOT NULL
  )
`).run();

/* =========================
   ADD NEW DOCTOR COLUMNS
========================= */

try {
  db.prepare("ALTER TABLE doctors ADD COLUMN email TEXT").run();
} catch (error) {}

try {
  db.prepare("ALTER TABLE doctors ADD COLUMN password TEXT").run();
} catch (error) {}

try {
  db.prepare("ALTER TABLE doctors ADD COLUMN specialization TEXT").run();
} catch (error) {}

try {
  db.prepare("ALTER TABLE doctors ADD COLUMN qualification TEXT").run();
} catch (error) {}

try {
  db.prepare("ALTER TABLE doctors ADD COLUMN experience TEXT").run();
} catch (error) {}

try {
  db.prepare("ALTER TABLE doctors ADD COLUMN license TEXT").run();
} catch (error) {}

/* =========================
   ADMIN ACCOUNT
========================= */

const ADMIN_EMAIL = "admin@nalamcare.com";
const ADMIN_PASSWORD = "Nalam@123";

/* =========================
   HOME
========================= */

app.get("/", (req, res) => {
  res.send("NalamCare Backend is Running!");
});

/* =========================
   DOCTOR API
========================= */

app.get("/api/doctors", (req, res) => {
  try {
    const doctors = db.prepare(`
      SELECT
        id,
        name,
        department,
        email,
        specialization,
        qualification,
        experience,
        license
      FROM doctors
    `).all();

    res.json(doctors);

  } catch (error) {
    console.error("Get doctors error:", error);

    res.status(500).json({
      message: "Failed to load doctors!"
    });
  }
});

/* =========================
   ADD DOCTOR
========================= */

app.post("/api/doctors", (req, res) => {
  const {
    name,
    department
  } = req.body;

  if (!name || !department) {
    return res.status(400).json({
      message: "Doctor name and department are required!"
    });
  }

  try {
    const result = db.prepare(`
      INSERT INTO doctors
      (name, department)
      VALUES (?, ?)
    `).run(
      name,
      department
    );

    res.json({
      message: "Doctor added successfully!",
      id: result.lastInsertRowid
    });

  } catch (error) {
    console.error("Add doctor error:", error);

    res.status(400).json({
      message: error.message
    });
  }
});

/* =========================
   DOCTOR REGISTRATION
========================= */

app.post("/api/doctors/register", (req, res) => {

  const {
    first_name,
    last_name,
    email,
    phone,
    password,
    department,
    specialization,
    qualification,
    experience,
    license
  } = req.body;

  if (
    !first_name ||
    !last_name ||
    !email ||
    !phone ||
    !password ||
    !department ||
    !specialization ||
    !qualification ||
    !experience ||
    !license
  ) {
    return res.status(400).json({
      message: "Please fill all doctor registration fields!"
    });
  }

  const name = `${first_name} ${last_name}`;

  try {

    const existingDoctor = db.prepare(`
      SELECT id
      FROM doctors
      WHERE email = ?
    `).get(email);

    if (existingDoctor) {
      return res.status(400).json({
        message: "Doctor email already exists!"
      });
    }

    const result = db.prepare(`
      INSERT INTO doctors
      (
        name,
        department,
        email,
        password,
        specialization,
        qualification,
        experience,
        license
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name,
      department,
      email,
      password,
      specialization,
      qualification,
      experience,
      license
    );

    res.json({
      message: "Doctor registered successfully!",
      id: result.lastInsertRowid
    });

  } catch (error) {

    console.error("Doctor registration error:", error);

    res.status(400).json({
      message: "Doctor registration failed!"
    });
  }
});

/* =========================
   PATIENT API
========================= */

app.get("/api/patients", (req, res) => {

  try {

    const patients = db.prepare(`
      SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        dob,
        gender,
        doctor_id
      FROM patients
    `).all();

    res.json(patients);

  } catch (error) {

    console.error("Get patients error:", error);

    res.status(500).json({
      message: "Failed to load patients!"
    });
  }
});
try {
    db.prepare("ALTER TABLE patients ADD COLUMN doctor_id INTEGER").run();
} catch (error) {}

/* =========================
   DOCTOR PATIENTS API
========================= */

app.get("/api/doctors/:id/patients", (req, res) => {

    const doctorId = req.params.id;

    try {

        const patients = db.prepare(`
            SELECT
                id,
                first_name,
                last_name,
                email,
                phone,
                dob,
                gender
            FROM patients
            WHERE doctor_id = ?
            ORDER BY id DESC
        `).all(doctorId);

        res.json(patients);

    } catch (error) {

        console.error(
            "Get doctor patients error:",
            error
        );

        res.status(500).json({
            message: "Failed to load doctor patients!"
        });

    }

});
/* =========================
   PATIENT REGISTRATION
========================= */

app.post("/api/patients", (req, res) => {

  const {
    first_name,
    last_name,
    email,
    phone,
    dob,
    gender,
    password
  } = req.body;

  if (
    !first_name ||
    !last_name ||
    !email ||
    !phone ||
    !dob ||
    !gender ||
    !password
  ) {
    return res.status(400).json({
      message: "Please fill all patient registration fields!"
    });
  }

  try {

    const result = db.prepare(`
      INSERT INTO patients
      (
        first_name,
        last_name,
        email,
        phone,
        dob,
        gender,
        password
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      first_name,
      last_name,
      email,
      phone,
      dob,
      gender,
      password
    );

    res.json({
      message: "Patient registered successfully!",
      id: result.lastInsertRowid
    });

  } catch (error) {

    console.error("Patient registration error:", error);

    res.status(400).json({
      message: "Email already exists or invalid data!"
    });
  }
});

app.post("/api/patients/doctor-add", (req, res) => {

    const {
        first_name,
        last_name,
        email,
        phone,
        dob,
        gender,
        doctor_id
    } = req.body;

    if (!first_name || !last_name || !email || !phone ||!doctor_id) {
        return res.status(400).json({
            message: "First name, last name, email and phone are required!"
        });
    }

    try {

        const existingPatient =
            db.prepare(`
                SELECT id
                FROM patients
                WHERE email = ?
            `).get(email);

        if (existingPatient) {
            return res.status(400).json({
                message: "A patient with this email already exists!"
            });
        }

        const result =
            db.prepare(`
                INSERT INTO patients
                (
                    first_name,
                    last_name,
                    email,
                    phone,
                    dob,
                    gender,
                    password,
                    doctor_id
                )
                VALUES (?, ?, ?, ?, ?, ?, ?,?)
            `).run(
                first_name,
                last_name,
                email,
                phone,
                dob || "",
                gender || "",
                "",
                doctor_id
            );

        res.json({
            message: "Patient added successfully!",
            id: result.lastInsertRowid
        });

    } catch (error) {

        console.error(
            "Doctor add patient error:",
            error
        );

        res.status(500).json({
            message: "Failed to add patient!"
        });

    }

});
db.prepare(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    appointment_date TEXT NOT NULL,
    appointment_time TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();
/* =========================
   APPOINTMENT API
========================= */

app.get("/api/appointments", (req, res) => {
    try {
        const appointments = db.prepare(`
            SELECT
                appointments.id,
                appointments.patient_id,
                appointments.doctor_id,
                appointments.appointment_date,
                appointments.appointment_time,
                appointments.reason,
                appointments.status,
                patients.first_name || ' ' || patients.last_name AS patient_name,
                doctors.name AS doctor_name,
                doctors.department
            FROM appointments
            LEFT JOIN patients ON appointments.patient_id = patients.id
            LEFT JOIN doctors ON appointments.doctor_id = doctors.id
            ORDER BY appointment_date, appointment_time
        `).all();

        res.json(appointments);

    } catch (error) {
        console.error("Get appointments error:", error);

        res.status(500).json({
            message: "Failed to load appointments!"
        });
    }
});


/* =========================
   CREATE APPOINTMENT
========================= */

app.post("/api/appointments", (req, res) => {

    const {
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        reason
    } = req.body;

    if (
        !patient_id ||
        !doctor_id ||
        !appointment_date ||
        !appointment_time
    ) {
        return res.status(400).json({
            message: "Patient, doctor, date and time are required!"
        });
    }

    try {

        const result = db.prepare(`
            INSERT INTO appointments
            (
                patient_id,
                doctor_id,
                appointment_date,
                appointment_time,
                reason
            )
            VALUES (?, ?, ?, ?, ?)
        `).run(
            patient_id,
            doctor_id,
            appointment_date,
            appointment_time,
            reason || ""
        );

        res.json({
            message: "Appointment booked successfully!",
            id: result.lastInsertRowid
        });

    } catch (error) {

        console.error("Create appointment error:", error);

        res.status(400).json({
            message: "Appointment booking failed!"
        });
    }
});
app.patch("/api/appointments/:id/status", (req, res) => {

    const { status } = req.body;
    const appointmentId = req.params.id;

    if (!["pending", "confirmed", "cancelled"].includes(status)) {
        return res.status(400).json({
            message: "Invalid appointment status!"
        });
    }

    try {

        const result = db.prepare(`
            UPDATE appointments
            SET status = ?
            WHERE id = ?
        `).run(status, appointmentId);

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Appointment not found!"
            });
        }

        res.json({
            message: "Appointment status updated successfully!",
            status: status
        });

    } catch (error) {

        console.error("Update appointment status error:", error);

        res.status(500).json({
            message: "Failed to update appointment status!"
        });
    }
});

/* =========================
   PRESCRIPTION TABLE
========================= */

db.prepare(`
    CREATE TABLE IF NOT EXISTS prescriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        patient_id INTEGER NOT NULL,
        doctor_id INTEGER NOT NULL,
        diagnosis TEXT,
        medicine TEXT,
        dosage TEXT,
        duration TEXT,
        instructions TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`).run();

/* =========================
   CREATE PRESCRIPTION
========================= */

app.post("/api/prescriptions", (req, res) => {

    const {
        patient_id,
        doctor_id,
        diagnosis,
        medicine,
        dosage,
        duration,
        instructions,
        notes
    } = req.body;

    if (!patient_id || !doctor_id || !medicine) {
        return res.status(400).json({
            message: "Patient, doctor and medicine are required!"
        });
    }

    try {

        const result = db.prepare(`
            INSERT INTO prescriptions
            (
                patient_id,
                doctor_id,
                diagnosis,
                medicine,
                dosage,
                duration,
                instructions,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            patient_id,
            doctor_id,
            diagnosis || "",
            medicine,
            dosage || "",
            duration || "",
            instructions || "",
            notes || ""
        );

        res.json({
            message: "Prescription saved successfully!",
            id: result.lastInsertRowid
        });

    } catch (error) {

        console.error(
            "Create prescription error:",
            error
        );

        res.status(500).json({
            message: "Failed to save prescription!"
        });

    }

});

/* =========================
   GET PATIENT PRESCRIPTIONS
========================= */

app.get("/api/patients/:id/prescriptions", (req, res) => {

    const patientId = req.params.id;

    try {

        const prescriptions = db.prepare(`
            SELECT
                prescriptions.id,
                prescriptions.diagnosis,
                prescriptions.medicine,
                prescriptions.dosage,
                prescriptions.duration,
                prescriptions.instructions,
                prescriptions.notes,
                prescriptions.created_at,
                doctors.name AS doctor_name,
                doctors.department
            FROM prescriptions
            LEFT JOIN doctors
                ON prescriptions.doctor_id = doctors.id
            WHERE prescriptions.patient_id = ?
            ORDER BY prescriptions.created_at DESC
        `).all(patientId);

        res.json(prescriptions);

    } catch (error) {

        console.error(
            "Get patient prescriptions error:",
            error
        );

        res.status(500).json({
            message: "Failed to load prescriptions!"
        });

    }

});
/* =========================
   DOCTOR AVAILABILITY TABLE
========================= */

db.prepare(`
    CREATE TABLE IF NOT EXISTS doctor_availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        doctor_id INTEGER NOT NULL,
        day TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        UNIQUE(doctor_id, day)
    )
`).run();

/* =========================
   SAVE DOCTOR AVAILABILITY
========================= */

app.post("/api/doctors/:id/availability", (req, res) => {

    const doctorId = req.params.id;
    const { days, start_time, end_time } = req.body;

    if (
        !doctorId ||
        !Array.isArray(days) ||
        days.length === 0 ||
        !start_time ||
        !end_time
    ) {
        return res.status(400).json({
            message: "Days and working hours are required!"
        });
    }

    if (start_time >= end_time) {
        return res.status(400).json({
            message: "End time must be later than start time!"
        });
    }

    try {

        const doctor = db.prepare(`
            SELECT id
            FROM doctors
            WHERE id = ?
        `).get(doctorId);

        if (!doctor) {
            return res.status(404).json({
                message: "Doctor not found!"
            });
        }

        const deleteAvailability = db.prepare(`
            DELETE FROM doctor_availability
            WHERE doctor_id = ?
        `);

        const insertAvailability = db.prepare(`
            INSERT INTO doctor_availability
            (
                doctor_id,
                day,
                start_time,
                end_time
            )
            VALUES (?, ?, ?, ?)
        `);

        const saveAvailability = db.transaction(() => {

            deleteAvailability.run(doctorId);

            days.forEach(day => {
                insertAvailability.run(
                    doctorId,
                    day,
                    start_time,
                    end_time
                );
            });

        });

        saveAvailability();

        res.json({
            message: "Availability saved successfully!"
        });

    } catch (error) {

        console.error(
            "Save availability error:",
            error
        );

        res.status(500).json({
            message: "Failed to save availability!"
        });

    }

});
/* =========================
   GET DOCTOR AVAILABILITY
========================= */

app.get("/api/doctors/:id/availability", (req, res) => {

    const doctorId = req.params.id;

    try {

        const availability = db.prepare(`
            SELECT
                day,
                start_time,
                end_time
            FROM doctor_availability
            WHERE doctor_id = ?
            ORDER BY id ASC
        `).all(doctorId);

        res.json(availability);

    } catch (error) {

        console.error(
            "Get availability error:",
            error
        );

        res.status(500).json({
            message: "Failed to load availability!"
        });

    }

});
/* =========================
   LOGIN
========================= */

app.post("/api/login", (req, res) => {

  const {
    email,
    password,
    role
  } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      message: "Email, password and role are required!"
    });
  }

  /* =========================
     PATIENT LOGIN
  ========================= */

  if (role === "patient") {

    const patient = db.prepare(`
      SELECT
        id,
        first_name,
        last_name,
        email,
        phone,
        dob,
        gender
      FROM patients
      WHERE email = ? AND password = ?
    `).get(
      email,
      password
    );

    if (!patient) {
      return res.status(401).json({
        message: "Invalid email or password!"
      });
    }

    return res.json({
      message: "Login successful!",
      role: "patient",
      user: patient
    });
  }

  /* =========================
     DOCTOR LOGIN
  ========================= */

  if (role === "doctor") {

    const doctor = db.prepare(`
      SELECT
        id,
        name,
        email,
        department,
        specialization,
        qualification,
        experience,
        license
      FROM doctors
      WHERE email = ? AND password = ?
    `).get(
      email,
      password
    );

    if (!doctor) {
      return res.status(401).json({
        message: "Invalid email or password!"
      });
    }

    return res.json({
      message: "Login successful!",
      role: "doctor",
      user: doctor
    });
  }

  /* =========================
     ADMIN LOGIN
  ========================= */

  if (role === "admin") {

    if (
      email === ADMIN_EMAIL &&
      password === ADMIN_PASSWORD
    ) {

      return res.json({
        message: "Login successful!",
        role: "admin",
        user: {
          id: 1,
          name: "NalamCare Admin",
          email: ADMIN_EMAIL
        }
      });
    }

    return res.status(401).json({
      message: "Invalid admin email or password!"
    });
  }

  return res.status(400).json({
    message: "Invalid login role!"
  });
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});