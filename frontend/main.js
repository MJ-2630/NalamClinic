/* =========================================
   NALAMCARE - MAIN JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================
       HERO SLIDER
    ========================================= */

    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".hero-dot");
    const prevBtn = document.querySelector(".hero-prev");
    const nextBtn = document.querySelector(".hero-next");

    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        if (!slides.length) return;

        if (index >= slides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = index;
        }

        slides.forEach((slide, i) => {
            slide.classList.toggle("active", i === currentSlide);
        });

        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === currentSlide);
        });
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    function startSlider() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 6000);
    }

    if (slides.length) {
        showSlide(0);
        startSlider();
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            nextSlide();
            startSlider();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            prevSlide();
            startSlider();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            showSlide(index);
            startSlider();
        });
    });


    /* =========================================
       SMOOTH SCROLL
    ========================================= */

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");

            if (targetId === "#") return;

            const target = document.querySelector(targetId);

            if (target) {
                e.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        });
    });


    /* =========================================
       NAVBAR ACTIVE LINK
    ========================================= */

    const sections = document.querySelectorAll("main section[id]");
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");

    function updateActiveNav() {
    let currentSection = "";

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;

        if (
            window.scrollY >= sectionTop &&
            window.scrollY < sectionTop + sectionHeight
        ) {
            currentSection = section.getAttribute("id");
        }
    });

    navLinks.forEach(link => {
        const href = link.getAttribute("href");

        if (href === `#${currentSection}`) {
            link.classList.add("active");
        } else if (currentSection) {
            link.classList.remove("active");
        }
    });
}

    window.addEventListener("scroll", updateActiveNav);
    updateActiveNav();


    /* =========================================
       NAVBAR SCROLL EFFECT
    ========================================= */

    const navbar = document.querySelector(".navbar");

    function navbarScrollEffect() {
        if (!navbar) return;

        if (window.scrollY > 40) {
            navbar.classList.add("navbar-scrolled");
        } else {
            navbar.classList.remove("navbar-scrolled");
        }
    }

    window.addEventListener("scroll", navbarScrollEffect);
    navbarScrollEffect();


    /* =========================================
       MOBILE NAVBAR AUTO CLOSE
    ========================================= */

    const navLinksMobile = document.querySelectorAll(".navbar-nav .nav-link");
    const navbarCollapse = document.querySelector(".navbar-collapse");

    navLinksMobile.forEach(link => {
        link.addEventListener("click", () => {
            if (
                window.innerWidth < 992 &&
                navbarCollapse &&
                navbarCollapse.classList.contains("show")
            ) {
                const toggle = document.querySelector(".navbar-toggler");

                if (toggle) {
                    toggle.click();
                }
            }
        });
    });


    /* =========================================
       SCROLL REVEAL
    ========================================= */

    const revealElements = document.querySelectorAll(
        ".department-card, .doctor-card, .why-us-card, .step-card, .service-card, .testimonial-card, .stat-card"
    );

    const revealObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12
        }
    );

    revealElements.forEach(element => {
        element.classList.add("reveal");
        revealObserver.observe(element);
    });


    /* =========================================
       APPOINTMENT FORM
    ========================================= */

    const appointmentForm = document.querySelector(".appointment-form");

    if (appointmentForm) {
        appointmentForm.addEventListener("submit", e => {
            e.preventDefault();

            const button = appointmentForm.querySelector(
                ".btn-find-slots"
            );

            if (button) {
                const originalText = button.innerHTML;

                button.innerHTML =
                    '<i class="bi bi-search"></i> Finding Slots...';

                button.disabled = true;

                setTimeout(() => {
                    button.innerHTML =
                        '<i class="bi bi-check-circle"></i> Slots Available';

                    button.disabled = false;

                    setTimeout(() => {
                        button.innerHTML = originalText;
                    }, 1800);
                }, 1000);
            }
        });
    }


    /* =========================================
       BACK TO TOP BUTTON
    ========================================= */

    const backToTop = document.querySelector(".back-to-top");

    if (backToTop) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 500) {
                backToTop.classList.add("show");
            } else {
                backToTop.classList.remove("show");
            }
        });

        backToTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

});
/* =========================================
   NALAMCARE BOOKING
   SECTION 1
   Doctor + Department + Date + Time
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* -----------------------------------------
       SELECTED BOOKING VALUES
    ----------------------------------------- */

    let selectedDoctor = "Dr. Arun Kumar";
    let selectedDepartment = "General Medicine";
    let selectedDate = "15 September 2026";
    let selectedTime = "10:00 AM";


    /* -----------------------------------------
       DOCTOR ELEMENTS
    ----------------------------------------- */

    const doctorButtons =
        document.querySelectorAll(".select-doctor-btn");

    const departmentSelect =
        document.getElementById("departmentSelect");

    const doctorCards =
        document.querySelectorAll(".booking-doctor-card");


    /* -----------------------------------------
       DOCTOR SELECTION
    ----------------------------------------- */

    doctorButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            selectedDoctor = this.dataset.doctor;

            const card =
                this.closest(".booking-doctor-card");

            if (card) {

                const specialty =
                    card.querySelector(".doctor-specialty");

                if (specialty) {
                    selectedDepartment =
                        specialty.textContent.trim();
                }
            }


            /* Reset all buttons */

            doctorButtons.forEach(function (btn) {

                btn.classList.remove("selected");

                btn.innerHTML =
                    'Select Doctor <i class="bi bi-arrow-right"></i>';

            });


            /* Selected button */

            this.classList.add("selected");

            this.innerHTML =
                'Doctor Selected <i class="bi bi-check-circle-fill"></i>';


            /* Update Confirmation */

            const summaryDoctor =
                document.getElementById("summaryDoctor");

            const summaryDepartment =
                document.getElementById("summaryDepartment");


            if (summaryDoctor) {
                summaryDoctor.textContent = selectedDoctor;
            }

            if (summaryDepartment) {
                summaryDepartment.textContent =
                    selectedDepartment;
            }


            console.log("Doctor:", selectedDoctor);
            console.log("Department:", selectedDepartment);

        });

    });


    /* -----------------------------------------
       DEPARTMENT FILTER
    ----------------------------------------- */

    if (departmentSelect) {

        departmentSelect.addEventListener("change", function () {

            const filterValue = this.value;


            doctorCards.forEach(function (card) {

                const specialty =
                    card.querySelector(".doctor-specialty");

                if (!specialty) return;


                const doctorDepartment =
                    specialty.textContent.trim();

                const cardColumn =
                    card.closest(".col-lg-3");


                if (
                    filterValue === "All Departments" ||
                    doctorDepartment === filterValue
                ) {

                    if (cardColumn) {
                        cardColumn.style.display = "";
                    }

                } else {

                    if (cardColumn) {
                        cardColumn.style.display = "none";
                    }

                }

            });

        });

    }


    /* -----------------------------------------
       CALENDAR DATE SELECTION
    ----------------------------------------- */

    const calendarDays =
        document.querySelectorAll(
            ".calendar-day:not(.muted)"
        );


    calendarDays.forEach(function (day) {

        day.addEventListener("click", function () {

            /* Remove previous active */

            calendarDays.forEach(function (item) {
                item.classList.remove("active");
            });


            /* Add active */

            this.classList.add("active");


            /* Save date */

            selectedDate =
                this.textContent.trim() +
                " September 2026";


            /* Update Confirmation */

            const summaryDate =
                document.getElementById("summaryDate");


            if (summaryDate) {
                summaryDate.textContent = selectedDate;
            }


            console.log("Date:", selectedDate);

        });

    });


    /* -----------------------------------------
       TIME SLOT SELECTION
    ----------------------------------------- */

    const timeSlots =
        document.querySelectorAll(
            ".time-slot:not(.disabled)"
        );


    timeSlots.forEach(function (slot) {

        slot.addEventListener("click", function () {

            /* Remove previous selected */

            timeSlots.forEach(function (item) {
                item.classList.remove("selected");
            });


            /* Add selected */

            this.classList.add("selected");


            /* Save time */

            selectedTime =
                this.textContent.trim();


            /* Update Confirmation */

            const summaryTime =
                document.getElementById("summaryTime");


            if (summaryTime) {
                summaryTime.textContent = selectedTime;
            }


            console.log("Time:", selectedTime);

        });

    });


});
/* =========================================
   NALAMCARE BOOKING
   SECTION 2 - CONFIRMATION UPDATE
========================================= */


/* -----------------------------------------
   PATIENT INPUTS
----------------------------------------- */

const patientName = document.getElementById("patientName");
const patientPhone = document.getElementById("patientPhone");
const patientEmail = document.getElementById("patientEmail");
const patientAge = document.getElementById("patientAge");


/* -----------------------------------------
   SUMMARY ELEMENTS
----------------------------------------- */

const summaryPatientName =
    document.getElementById("summaryPatientName");

const summaryPatientPhone =
    document.getElementById("summaryPatientPhone");

const summaryPatientEmail =
    document.getElementById("summaryPatientEmail");

const summaryPatientAge =
    document.getElementById("summaryPatientAge");

const summaryDoctor =
    document.getElementById("summaryDoctor");

const summaryDate =
    document.getElementById("summaryDate");

const summaryTime =
    document.getElementById("summaryTime");

const summaryDepartment =
    document.getElementById("summaryDepartment");


/* -----------------------------------------
   LIVE PATIENT DETAILS UPDATE
----------------------------------------- */

function updatePatientSummary() {

    if (patientName && summaryPatientName) {
        summaryPatientName.textContent =
            patientName.value.trim() || "Not Provided";
    }

    if (patientPhone && summaryPatientPhone) {
        summaryPatientPhone.textContent =
            patientPhone.value.trim() || "Not Provided";
    }

    if (patientEmail && summaryPatientEmail) {
        summaryPatientEmail.textContent =
            patientEmail.value.trim() || "Not Provided";
    }

    if (patientAge && summaryPatientAge) {
        summaryPatientAge.textContent =
            patientAge.value.trim()
            ? patientAge.value.trim() + " Years"
            : "Not Provided";
    }
}


/* -----------------------------------------
   LISTEN FOR INPUT
----------------------------------------- */

if (patientName) {
    patientName.addEventListener("input", updatePatientSummary);
}

if (patientPhone) {
    patientPhone.addEventListener("input", updatePatientSummary);
}

if (patientEmail) {
    patientEmail.addEventListener("input", updatePatientSummary);
}

if (patientAge) {
    patientAge.addEventListener("input", updatePatientSummary);
}


/* -----------------------------------------
   CONFIRM APPOINTMENT
----------------------------------------- */


const bookingTerms =
    document.getElementById("bookingTerms");

const confirmButton =
    document.querySelector(".confirm-booking-btn");


if (confirmButton) {

    confirmButton.addEventListener("click", function () {

        updatePatientSummary();


        if (!bookingTerms.checked) {

            alert(
                "Please agree to the Terms & Conditions and Privacy Policy."
            );

            return;
        }


        if (
            !patientName.value.trim() ||
            !patientPhone.value.trim()
        ) {

            alert(
                "Please enter your required patient details."
            );

            return;
        }


        if (!window.selectedDoctorId) {
    alert("Please select a doctor.");
    return;
}

const patient = JSON.parse(localStorage.getItem("user"));

const selectedDate =
    document.querySelector(".calendar-day.active")?.textContent.trim();

const selectedTime =
    document.querySelector(".time-slot.selected")?.textContent.trim();

const reason =
    document.getElementById("visitReason").value.trim();

fetch("/api/appointments", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        patient_id: patient.id,
        doctor_id: window.selectedDoctorId,
        appointment_date: `2026-09-${selectedDate.padStart(2, "0")}`,
        appointment_time: selectedTime,
        reason: reason
    })
})
.then(response => response.json())
.then(data => {

    if (data.message === "Appointment booked successfully!") {
        alert("Appointment confirmed successfully!");
    } else {
        alert(data.message || "Appointment booking failed!");
    }

})
.catch(error => {
    console.error(error);
    alert("Server connection failed!");
});

    });

}
// Doctors Search & Filter
const doctorSearch = document.getElementById("doctorSearch");
const doctorDepartment = document.getElementById("doctorDepartment");
const doctorItems = document.querySelectorAll(".doctor-item");

function filterDoctors() {
    const searchValue = doctorSearch ? doctorSearch.value.toLowerCase().trim() : "";
    const departmentValue = doctorDepartment ? doctorDepartment.value : "All Departments";
    const noDoctorsFound = document.getElementById("noDoctorsFound");
    let visibleDoctors = 0;

    doctorItems.forEach(function(item) {
        const card = item.querySelector(".doctor-page-card");
        const name = card.querySelector("h3")?.textContent.toLowerCase() || "";
        const specialty = card.querySelector(".doctor-specialty")?.textContent.trim() || "";
        const matchesSearch = name.includes(searchValue) || specialty.toLowerCase().includes(searchValue);
        const matchesDepartment = departmentValue === "All Departments" || specialty === departmentValue;

        if (matchesSearch && matchesDepartment) {
            item.style.display = "";
            visibleDoctors++;
        } else {
            item.style.display = "none";
        }
    });

    if (noDoctorsFound) {
        noDoctorsFound.style.display = visibleDoctors === 0 ? "block" : "none";
    }
}