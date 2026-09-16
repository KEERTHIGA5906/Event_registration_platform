/* =========================================
   EVENTSPHERE
   MILESTONE 3
   SMART CAMPUS VIEW
   ========================================= */


/* =========================================
   CAMPUS VENUE DATA
   ========================================= */

const venues = {

    "Main Block": {

        block: "Block A",

        floor: "Ground Floor",

        type: "Administration",

        description:
            "The main administrative and registration area of the campus.",

        route:
            "Enter through the main gate → Walk straight → Main Block is on the left."

    },


    "Main Auditorium": {

        block: "Block A",

        floor: "Ground Floor",

        type: "Event Hall",

        description:
            "Main auditorium used for inauguration, presentations and closing ceremonies.",

        route:
            "Enter through the main gate → Follow the central road → Auditorium is on the right."

    },


    "Seminar Hall": {

        block: "Block B",

        floor: "First Floor",

        type: "Seminar Hall",

        description:
            "Seminar hall used for technical presentations and evaluation sessions.",

        route:
            "Enter through the main gate → Follow the central road → Go to Block B → First Floor."

    },


    "Innovation Lab": {

        block: "Block B",

        floor: "Ground Floor",

        type: "Computer Lab",

        description:
            "Innovation laboratory used for hackathons, workshops and practical activities.",

        route:
            "Enter through the main gate → Follow the central road → Block B → Ground Floor."

    },


    "Cafeteria": {

        block: "Central Area",

        floor: "Ground Floor",

        type: "Food Court",

        description:
            "Central cafeteria where participants can have refreshments and meals.",

        route:
            "Enter through the main gate → Walk towards the central area → Cafeteria is near the center."

    }

};



/* =========================================
   CURRENT VENUE
   ========================================= */

let selectedVenue = null;



/* =========================================
   SELECT VENUE
   ========================================= */

function selectVenue(name) {


    selectedVenue = name;


    const venue =
        venues[name];


    if (!venue) {

        return;

    }



    /* REMOVE OLD ACTIVE */

    document
        .querySelectorAll(".building")
        .forEach(
            function(building) {

                building.classList.remove(
                    "active"
                );

            }
        );



    /* ACTIVE BUILDING */

    const selected =
        document.querySelector(
            `[data-name="${name}"]`
        );


    if (selected) {

        selected.classList.add(
            "active"
        );

    }



    /* UPDATE DETAILS */

    document.getElementById(
        "venueTitle"
    ).textContent =
        "📍 " + name;


    document.getElementById(
        "venueDescription"
    ).textContent =
        venue.description;


    document.getElementById(
        "venueBlock"
    ).textContent =
        "🏢 Block: " +
        venue.block;


    document.getElementById(
        "venueFloor"
    ).textContent =
        "🏬 Floor: " +
        venue.floor;


    document.getElementById(
        "venueType"
    ).textContent =
        "📌 Type: " +
        venue.type;


    document.getElementById(
        "routeText"
    ).textContent =
        venue.route;

}



/* =========================================
   SEARCH VENUE
   ========================================= */

function searchVenue() {


    const input =
        document.getElementById(
            "venueSearch"
        );


    const search =
        input.value
            .toLowerCase()
            .trim();


    const buildings =
        document.querySelectorAll(
            ".building"
        );


    let found = false;



    buildings.forEach(
        function(building) {


            const name =
                building
                    .getAttribute(
                        "data-name"
                    )
                    .toLowerCase();


            if (
                search === "" ||
                name.includes(search)
            ) {

                building.style.display =
                    "block";

            }

            else {

                building.style.display =
                    "none";

            }

        }
    );



    /* AUTO SELECT EXACT MATCH */

    for (
        const name in venues
    ) {


        if (
            name.toLowerCase() === search
        ) {

            selectVenue(name);

            found = true;

            break;

        }

    }



    if (
        search !== "" &&
        !found
    ) {

        document.getElementById(
            "venueTitle"
        ).textContent =
            "Venue not found";


        document.getElementById(
            "venueDescription"
        ).textContent =
            "Try searching for Main Block, Main Auditorium, Seminar Hall, Innovation Lab or Cafeteria.";

    }

}



/* =========================================
   SHOW ROUTE
   ========================================= */

function showRoute() {


    if (!selectedVenue) {

        alert(
            "Please select a venue first."
        );

        return;

    }


    const venue =
        venues[selectedVenue];


    alert(

        "🧭 ROUTE TO " +
        selectedVenue.toUpperCase() +

        "\n\n" +

        venue.route

    );

}



/* =========================================
   KEYBOARD SEARCH
   ========================================= */

document
    .getElementById("venueSearch")
    .addEventListener(
        "keyup",
        function(event) {

            if (
                event.key === "Enter"
            ) {

                searchVenue();

            }

        }
    );