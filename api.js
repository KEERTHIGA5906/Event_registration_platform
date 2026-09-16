/* =========================================
   EVENTSPHERE - REST API STATUS
   ========================================= */


/* API BASE URL */

const API =
    "http://127.0.0.1:5000/api";


/* =========================================
   CHECK API CONNECTION
   ========================================= */

async function checkAPI() {

    const statusBox =
        document.getElementById("apiStatus");

    const resultBox =
        document.getElementById("apiResult");


    if (statusBox) {

        statusBox.className =
            "api-status";

        statusBox.textContent =
            "Checking API server...";

    }


    if (resultBox) {

        resultBox.className =
            "api-status";

        resultBox.textContent =
            "Checking connection...";

    }


    try {

        const response =
            await fetch(
                API + "/health"
            );


        if (!response.ok) {

            throw new Error(
                "Server returned status " +
                response.status
            );

        }


        const data =
            await response.json();


        if (statusBox) {

            statusBox.className =
                "api-status api-online";

            statusBox.innerHTML = `
                <strong>
                    ✓ API Server Online
                </strong>
                <br>
                ${data.message || "EventSphere API is running successfully."}
            `;

        }


        if (resultBox) {

            resultBox.className =
                "api-status api-online";

            resultBox.innerHTML = `
                <strong>
                    ✓ Connection Successful
                </strong>
                <br>
                EventSphere backend is connected.
            `;

        }


        return true;

    } catch (error) {

        console.error(
            "API connection error:",
            error
        );


        if (statusBox) {

            statusBox.className =
                "api-status api-offline";

            statusBox.innerHTML = `
                <strong>
                    ✗ API Server Offline
                </strong>
                <br>
                Please start the Flask backend.
            `;

        }


        if (resultBox) {

            resultBox.className =
                "api-status api-offline";

            resultBox.innerHTML = `
                <strong>
                    ✗ Connection Failed
                </strong>
                <br>
                Make sure the EventSphere Flask server
                is running on port 5000.
            `;

        }


        return false;

    }

}


/* =========================================
   CHECK API WHEN PAGE LOADS
   ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        checkAPI();

    }
);