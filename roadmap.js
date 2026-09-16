/* =========================================
   EVENTSPHERE
   MILESTONE 3
   SMART EVENT ROADMAP
   ========================================= */


/* =========================================
   GET REGISTERED PARTICIPANT
   ========================================= */

let attendee =
    JSON.parse(
        localStorage.getItem("lastTicket")
    );


/* =========================================
   GET EVENTS CREATED IN EVENTSPHERE
   ========================================= */

let events =
    JSON.parse(
        localStorage.getItem("events")
    ) || [];



/* =========================================
   CHECK REGISTRATION
   ========================================= */

if (!attendee) {

    document.getElementById(
        "roadmapContainer"
    ).innerHTML = `

        <div style="
            text-align:center;
            padding:40px;
        ">

            <h2>
                No Registration Found
            </h2>

            <p>
                Please register for an event
                before viewing the roadmap.
            </p>

            <button
                onclick="location.href='registration.html'">

                Register Now

            </button>

        </div>

    `;

}


/* =========================================
   REGISTERED USER FOUND
   ========================================= */

else {


    /* SHOW PARTICIPANT NAME */

    document.getElementById(
        "participantName"
    ).textContent =
        attendee.name || "Participant";



    /* =====================================
       FIND REGISTERED EVENT
       ===================================== */

    let event =
        events.find(
            function(e) {

                return e.id == attendee.eventId;

            }
        );



    /* =====================================
       EVENT NOT FOUND
       ===================================== */

    if (!event) {

        document.getElementById(
            "eventName"
        ).textContent =
            "Event Not Found";


        document.getElementById(
            "roadmapContainer"
        ).innerHTML = `

            <div style="
                text-align:center;
                padding:40px;
            ">

                <h2>
                    Event Information Not Found
                </h2>

                <p>
                    The event connected to this
                    registration could not be found.
                </p>

            </div>

        `;

    }


    /* =====================================
       EVENT FOUND
       ===================================== */

    else {

        loadEventRoadmap(event);

    }

}



/* =========================================
   LOAD EVENT ROADMAP
   ========================================= */

function loadEventRoadmap(event) {


    /* EVENT INFORMATION */

    document.getElementById(
        "eventName"
    ).textContent =
        event.name || "Event";


    document.getElementById(
        "eventDate"
    ).textContent =
        "📅 " +
        (event.date || "Date not available");


    document.getElementById(
        "eventTime"
    ).textContent =
        "🕘 " +
        (event.time || "Time not available");


    document.getElementById(
        "eventVenue"
    ).textContent =
        "📍 " +
        (event.venue || "Venue not assigned");



    /* =====================================
       CREATE ROADMAP
       ===================================== */

    let roadmap =
        createRoadmap(event);



    displayRoadmap(roadmap);

}



/* =========================================
   CREATE EVENT-SPECIFIC ROADMAP
   ========================================= */

function createRoadmap(event) {


    let venue =
        event.venue || "Event Venue";


    let time =
        event.time || "Event Time";


    return [

        {
            activity: "Registration",

            time: "Before " + time,

            venue: venue,

            description:
                "Complete your registration and keep your digital ticket ready.",

            status: "completed"
        },


        {
            activity: "Participant Check-in",

            time: "Before event starts",

            venue: venue,

            description:
                "Reach the venue, show your QR ticket and complete participant check-in.",

            status: "completed"
        },


        {
            activity: "Opening / Welcome Session",

            time: time,

            venue: venue,

            description:
                "Attend the opening session and listen to the event instructions.",

            status: "current"
        },


        {
            activity: "Main Event",

            time: "Event Session",

            venue: venue,

            description:
                "Proceed to the main event area and participate in the scheduled activities.",

            status: "upcoming"
        },


        {
            activity: "Activity / Submission",

            time: "As scheduled",

            venue: venue,

            description:
                "Complete the required activity, presentation, competition or submission for the event.",

            status: "upcoming"
        },


        {
            activity: "Evaluation / Review",

            time: "As scheduled",

            venue: venue,

            description:
                "Participate in evaluation, review or judging if applicable to the event.",

            status: "upcoming"
        },


        {
            activity: "Closing Ceremony",

            time: "Final Session",

            venue: venue,

            description:
                "Attend the closing session and receive announcements, certificates or prizes.",

            status: "upcoming"
        }

    ];

}



/* =========================================
   DISPLAY ROADMAP
   ========================================= */

function displayRoadmap(roadmap) {


    const container =
        document.getElementById(
            "roadmapContainer"
        );


    container.innerHTML = "";


    let completed = 0;



    roadmap.forEach(
        function(step, index) {


            if (
                step.status === "completed"
            ) {

                completed++;

            }



            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "roadmap-step " +
                step.status;



            /* STEP NUMBER */

            let number =
                index + 1;


            if (
                step.status === "completed"
            ) {

                number = "✓";

            }



            /* LOCATION BUTTON */

            let locationButton = "";


            if (
                step.status === "current"
            ) {

                locationButton = `

                    <button
                        class="location-btn"
                        onclick="showLocation('${step.venue}')">

                        📍 View Location

                    </button>

                `;

            }



            /* STEP CONTENT */

            item.innerHTML = `

                <div class="step-number">

                    ${number}

                </div>


                <div class="step-content">

                    <div class="step-status">

                        ${getStatusText(
                            step.status
                        )}

                    </div>


                    <h3>

                        ${step.activity}

                    </h3>


                    <p>

                        ${step.description}

                    </p>


                    <div class="step-details">

                        <span>
                            🕘 ${step.time}
                        </span>


                        <span>
                            📍 ${step.venue}
                        </span>

                    </div>


                    ${locationButton}

                </div>

            `;


            container.appendChild(item);

        }
    );



    /* =====================================
       UPDATE PROGRESS
       ===================================== */

    let total =
        roadmap.length;


    let percentage =
        Math.round(
            (completed / total) * 100
        );


    document.getElementById(
        "progressText"
    ).textContent =
        completed +
        " of " +
        total +
        " activities completed";


    document.getElementById(
        "progressPercentage"
    ).textContent =
        percentage + "%";


    document.getElementById(
        "progressBar"
    ).style.width =
        percentage + "%";

}



/* =========================================
   STATUS TEXT
   ========================================= */

function getStatusText(status) {


    if (status === "completed") {

        return "COMPLETED";

    }


    if (status === "current") {

        return "CURRENT STEP";

    }


    return "UPCOMING";

}



/* =========================================
   SHOW LOCATION
   ========================================= */

function showLocation(location) {


    alert(

        "📍 YOUR NEXT LOCATION\n\n" +

        location +

        "\n\nPlease follow the event signs."

    );

}