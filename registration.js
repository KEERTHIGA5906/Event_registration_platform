document.addEventListener("DOMContentLoaded", () => {

    const API = "http://127.0.0.1:5000/api";

    const form = document.getElementById("registrationForm");

    const eventSelect =
        document.getElementById("eventId");

    const message =
        document.getElementById("registrationMessage");


    // --------------------------------------------------
    // LOAD EVENTS
    // --------------------------------------------------

    function loadEvents() {

        const events =
            JSON.parse(
                localStorage.getItem("events")
            ) || [];

        eventSelect.innerHTML =
            `<option value="">Select Event</option>`;

        events.forEach(event => {

            const option =
                document.createElement("option");

            option.value = event.id;

            option.textContent =
                `${event.name} - ${event.date}`;

            eventSelect.appendChild(option);

        });
    }


    // --------------------------------------------------
    // GENERATE TICKET ID
    // --------------------------------------------------

    function generateTicketId() {

        const attendees =
            JSON.parse(
                localStorage.getItem("attendees")
            ) || [];

        let number = 1001;

        let ticketId;

        do {

            ticketId =
                "TKT" + number;

            number++;

        } while (
            attendees.some(
                attendee =>
                    attendee.ticketId === ticketId
            )
        );

        return ticketId;
    }


    // --------------------------------------------------
    // GENERATE REGISTRATION ID
    // --------------------------------------------------

    function generateRegistrationId() {

        const attendees =
            JSON.parse(
                localStorage.getItem("attendees")
            ) || [];

        let number =
            attendees.length + 1;

        let regId;

        do {

            regId =
                "REG" +
                String(number).padStart(4, "0");

            number++;

        } while (
            attendees.some(
                attendee =>
                    attendee.regId === regId
            )
        );

        return regId;
    }


    // --------------------------------------------------
    // SHOW MESSAGE
    // --------------------------------------------------

    function showMessage(text, type = "success") {

        message.textContent = text;

        message.className =
            type === "success"
                ? "success-message"
                : "error-message";
    }


    // --------------------------------------------------
    // SEND REGISTRATION TO BACKEND
    // --------------------------------------------------

    async function sendToBackend(attendee) {

        try {

            const response =
                await fetch(
                    `${API}/attendees`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                reg_id:
                                    attendee.regId,

                                event_id:
                                    attendee.eventId,

                                name:
                                    attendee.name,

                                email:
                                    attendee.email,

                                phone:
                                    attendee.phone,

                                college:
                                    attendee.college,

                                department:
                                    attendee.department,

                                year:
                                    attendee.year,

                                ticket_id:
                                    attendee.ticketId,

                                status:
                                    attendee.status
                            })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                console.log(
                    "Backend registration:",
                    data.error
                );

                return false;
            }

            return true;

        } catch (error) {

            console.log(
                "Backend unavailable:",
                error
            );

            return false;
        }
    }


    // --------------------------------------------------
    // FORM SUBMIT
    // --------------------------------------------------

    form.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            // ------------------------------------------
            // GET VALUES
            // ------------------------------------------

            const eventId =
                Number(eventSelect.value);

            const name =
                document
                    .getElementById("studentName")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();

            const college =
                document
                    .getElementById("college")
                    .value
                    .trim();

            const department =
                document
                    .getElementById("department")
                    .value
                    .trim();

            const year =
                document
                    .getElementById("year")
                    .value;

            const terms =
                document
                    .getElementById("terms")
                    .checked;


            // ------------------------------------------
            // LOAD DATA
            // ------------------------------------------

            const events =
                JSON.parse(
                    localStorage.getItem("events")
                ) || [];

            const attendees =
                JSON.parse(
                    localStorage.getItem("attendees")
                ) || [];

            const tickets =
                JSON.parse(
                    localStorage.getItem("tickets")
                ) || [];


            // ------------------------------------------
            // VALIDATION
            // ------------------------------------------

            if (!eventId) {

                showMessage(
                    "Please select an event.",
                    "error"
                );

                return;
            }


            if (!name) {

                showMessage(
                    "Please enter participant name.",
                    "error"
                );

                return;
            }


            if (!/^\d{10}$/.test(phone)) {

                showMessage(
                    "Phone number must contain exactly 10 digits.",
                    "error"
                );

                return;
            }


            if (!terms) {

                showMessage(
                    "Please accept the terms and conditions.",
                    "error"
                );

                return;
            }


            // ------------------------------------------
            // FIND EVENT
            // ------------------------------------------

            const event =
                events.find(
                    e => Number(e.id) === eventId
                );


            if (!event) {

                showMessage(
                    "Selected event not found.",
                    "error"
                );

                return;
            }


            // ------------------------------------------
            // CHECK DUPLICATE
            // ------------------------------------------

            const duplicate =
                attendees.find(
                    attendee =>
                        Number(attendee.eventId)
                            === eventId &&
                        (
                            attendee.email
                                .toLowerCase()
                                === email.toLowerCase()
                            ||
                            attendee.phone
                                === phone
                        )
                );


            if (duplicate) {

                showMessage(
                    "This participant is already registered for this event.",
                    "error"
                );

                return;
            }


            // ------------------------------------------
            // CHECK PARTICIPANT LIMIT
            // ------------------------------------------

            const registeredCount =
                attendees.filter(
                    attendee =>
                        Number(attendee.eventId)
                            === eventId
                ).length;


            if (
                event.participants > 0 &&
                registeredCount >=
                    Number(event.participants)
            ) {

                showMessage(
                    "Participant limit reached for this event.",
                    "error"
                );

                return;
            }


            // ------------------------------------------
            // CREATE IDs
            // ------------------------------------------

            const regId =
                generateRegistrationId();

            const ticketId =
                generateTicketId();


            // ------------------------------------------
            // CREATE ATTENDEE
            // ------------------------------------------

            const attendee = {

                regId: regId,

                eventId: eventId,

                name: name,

                email: email,

                phone: phone,

                college: college,

                department: department,

                year: year,

                ticketId: ticketId,

                status: "Registered",

                date:
                    new Date()
                        .toLocaleDateString()
            };


            // ------------------------------------------
            // SAVE LOCAL STORAGE
            // ------------------------------------------

            attendees.push(attendee);

            tickets.push({

                ticketId: ticketId,

                registrationId: regId,

                eventId: eventId,

                participant: name,

                issueDate:
                    new Date()
                        .toLocaleDateString()

            });


            localStorage.setItem(
                "attendees",
                JSON.stringify(attendees)
            );

            localStorage.setItem(
                "tickets",
                JSON.stringify(tickets)
            );


            // ------------------------------------------
            // IMPORTANT:
            // LAST TICKET IS PRESERVED
            // FOR ticket.js
            // ------------------------------------------

            localStorage.setItem(
                "lastTicket",
                JSON.stringify(attendee)
            );


            // ------------------------------------------
            // SEND TO BACKEND
            // ------------------------------------------

            const backendSaved =
                await sendToBackend(attendee);


            // ------------------------------------------
            // REDIRECT TO TICKET
            // ------------------------------------------

            if (backendSaved) {

                console.log(
                    "Registration saved to backend."
                );

            } else {

                console.log(
                    "Backend unavailable. Local registration retained."
                );
            }


            window.location.href =
                "ticket.html";

        }
    );


    // --------------------------------------------------
    // INITIALIZE
    // --------------------------------------------------

    loadEvents();

});