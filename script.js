// =====================================================
// EVENTSPHERE - ORGANIZER DASHBOARD
// Milestone 3 Backend Synchronization
// =====================================================

const API = "http://127.0.0.1:5000/api";


// =====================================================
// LOCAL STORAGE DATA
// =====================================================

let events =
    JSON.parse(localStorage.getItem("events")) || [];

let venues =
    JSON.parse(localStorage.getItem("venues")) || [];

let resources =
    JSON.parse(localStorage.getItem("resources")) || [];

let attendees =
    JSON.parse(localStorage.getItem("attendees")) || [];

let tickets =
    JSON.parse(localStorage.getItem("tickets")) || [];

let vendors =
    JSON.parse(localStorage.getItem("vendors")) || [];

let assignments =
    JSON.parse(localStorage.getItem("assignments")) || [];


// =====================================================
// HELPER
// =====================================================

const $ = id =>
    document.getElementById(id);


// =====================================================
// SAVE LOCAL DATA
// =====================================================

function save() {

    localStorage.setItem(
        "events",
        JSON.stringify(events)
    );

    localStorage.setItem(
        "venues",
        JSON.stringify(venues)
    );

    localStorage.setItem(
        "resources",
        JSON.stringify(resources)
    );

    localStorage.setItem(
        "attendees",
        JSON.stringify(attendees)
    );

    localStorage.setItem(
        "tickets",
        JSON.stringify(tickets)
    );

    localStorage.setItem(
        "vendors",
        JSON.stringify(vendors)
    );

    localStorage.setItem(
        "assignments",
        JSON.stringify(assignments)
    );
}


// =====================================================
// MESSAGE
// =====================================================

function msg(text, type = "success") {

    const element = $("message");

    if (!element) {
        return;
    }

    element.textContent = text;

    element.className =
        type === "success"
            ? "success-message"
            : "error-message";
}


// =====================================================
// BACKEND REQUEST
// =====================================================

async function apiRequest(
    endpoint,
    method = "GET",
    data = null
) {

    try {

        const options = {
            method: method,
            headers: {
                "Content-Type":
                    "application/json"
            }
        };

        if (data !== null) {

            options.body =
                JSON.stringify(data);
        }

        const response =
            await fetch(
                API + endpoint,
                options
            );

        const result =
            await response.json();

        if (!response.ok) {

            console.log(
                "API Error:",
                result
            );

            return {
                success: false,
                data: result
            };
        }

        return {
            success: true,
            data: result
        };

    } catch (error) {

        console.log(
            "Backend unavailable:",
            error
        );

        return {
            success: false,
            data: null
        };
    }
}


// =====================================================
// DASHBOARD COUNTS
// =====================================================

function updateCounts() {

    if ($("eventCount")) {

        $("eventCount").textContent =
            events.length;
    }

    if ($("venueCount")) {

        $("venueCount").textContent =
            venues.length;
    }

    if ($("resourceCount")) {

        $("resourceCount").textContent =
            resources.length;
    }

    if ($("registrationCount")) {

        $("registrationCount").textContent =
            attendees.length;
    }

    if ($("vendorCount")) {

        $("vendorCount").textContent =
            vendors.length;
    }
}


// =====================================================
// EVENT OPTIONS
// =====================================================

function eventOptions() {

    const selects = [
        $("eventSelect"),
        $("resourceEvent"),
        $("vendorEvent"),
        $("registrationEventFilter")
    ];

    selects.forEach(select => {

        if (!select) {
            return;
        }

        const currentValue =
            select.value;

        let firstText =
            "Select Event";

        if (
            select.id ===
            "registrationEventFilter"
        ) {

            firstText =
                "All Events";
        }

        select.innerHTML =
            `<option value="">
                ${firstText}
            </option>`;

        events.forEach(event => {

            const option =
                document.createElement("option");

            option.value =
                event.id;

            option.textContent =
                `${event.name} - ${event.date}`;

            select.appendChild(option);

        });

        if (currentValue) {

            select.value =
                currentValue;
        }

    });
}


// =====================================================
// SHOW EVENTS
// =====================================================

function showEvents() {

    const list =
        $("eventList");

    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (events.length === 0) {

        list.innerHTML =
            `<p class="empty-message">
                No events created yet.
            </p>`;

        return;
    }

    events.forEach(event => {

        const card =
            document.createElement("div");

        card.className =
            "item-card";

        card.innerHTML = `

            <h3>${escapeHTML(event.name)}</h3>

            <p>
                <strong>Type:</strong>
                ${escapeHTML(event.type || "N/A")}
            </p>

            <p>
                <strong>Date:</strong>
                ${escapeHTML(event.date || "N/A")}
            </p>

            <p>
                <strong>Time:</strong>
                ${escapeHTML(event.time || "N/A")}
            </p>

            <p>
                <strong>Budget:</strong>
                ${Number(event.budget || 0).toLocaleString()}
            </p>

            <p>
                <strong>Participants:</strong>
                ${event.participants || 0}
            </p>

            <p>
                <strong>Venue:</strong>
                ${escapeHTML(event.venue || "Not Assigned")}
            </p>

        `;

        list.appendChild(card);

    });
}


// =====================================================
// EVENT CREATION
// =====================================================

const eventForm =
    $("eventForm");

if (eventForm) {

    eventForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            const name =
                $("eventName").value.trim();

            const type =
                $("eventType").value;

            const date =
                $("eventDate").value;

            const time =
                $("eventTime").value;

            const budget =
                Number(
                    $("eventBudget").value
                );

            const participants =
                Number(
                    $("eventParticipants").value
                );


            if (!name) {

                msg(
                    "Please enter event name.",
                    "error"
                );

                return;
            }


            if (!date) {

                msg(
                    "Please select event date.",
                    "error"
                );

                return;
            }


            if (budget < 0) {

                msg(
                    "Budget cannot be negative.",
                    "error"
                );

                return;
            }


            if (participants < 0) {

                msg(
                    "Participant count cannot be negative.",
                    "error"
                );

                return;
            }


            // -----------------------------------------
            // CREATE LOCAL EVENT
            // -----------------------------------------

            const event = {

                id:
                    Date.now(),

                name:
                    name,

                type:
                    type,

                date:
                    date,

                time:
                    time,

                budget:
                    budget,

                participants:
                    participants,

                venue:
                    "Not Assigned",

                resources:
                    []

            };


            events.push(event);

            save();

            showEvents();

            eventOptions();

            updateCounts();


            // -----------------------------------------
            // SEND TO BACKEND
            // -----------------------------------------

            const backendResult =
                await apiRequest(
                    "/events",
                    "POST",
                    {
                        name:
                            name,

                        type:
                            type,

                        date:
                            date,

                        time:
                            time,

                        budget:
                            budget,

                        participants:
                            participants,

                        venue:
                            "Not Assigned"
                    }
                );


            if (
                backendResult.success
            ) {

                msg(
                    "Event created successfully and synchronized with backend.",
                    "success"
                );

            } else {

                msg(
                    "Event created locally. Backend is currently unavailable.",
                    "success"
                );

            }


            eventForm.reset();

        }
    );
}


// =====================================================
// VENUE OPTIONS
// =====================================================

function venueOptions() {

    const select =
        $("venueSelect");

    if (!select) {
        return;
    }

    const currentValue =
        select.value;

    select.innerHTML =
        `<option value="">
            Select Venue
        </option>`;

    venues.forEach(venue => {

        const option =
            document.createElement("option");

        option.value =
            venue.id;

        option.textContent =
            `${venue.name} - Capacity ${venue.capacity}`;

        select.appendChild(option);

    });

    if (currentValue) {

        select.value =
            currentValue;
    }
}


// =====================================================
// SHOW VENUES
// =====================================================

function showVenues() {

    const list =
        $("venueList");

    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (venues.length === 0) {

        list.innerHTML =
            `<p class="empty-message">
                No venues added yet.
            </p>`;

        return;
    }

    venues.forEach(venue => {

        const card =
            document.createElement("div");

        card.className =
            "item-card";

        card.innerHTML = `

            <h3>
                ${escapeHTML(venue.name)}
            </h3>

            <p>
                <strong>Location:</strong>
                ${escapeHTML(venue.location)}
            </p>

            <p>
                <strong>Capacity:</strong>
                ${venue.capacity}
            </p>

            <p>
                <strong>Status:</strong>
                ${venue.available
                    ? "Available"
                    : "Unavailable"}
            </p>

        `;

        list.appendChild(card);

    });
}


// =====================================================
// VENUE CREATION
// =====================================================

const venueForm =
    $("venueForm");

if (venueForm) {

    venueForm.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            const name =
                $("venueName")
                    .value
                    .trim();

            const location =
                $("venueLocation")
                    .value
                    .trim();

            const capacity =
                Number(
                    $("venueCapacity")
                        .value
                );


            if (!name) {

                msg(
                    "Please enter venue name.",
                    "error"
                );

                return;
            }


            if (capacity <= 0) {

                msg(
                    "Venue capacity must be greater than zero.",
                    "error"
                );

                return;
            }


            const venue = {

                id:
                    Date.now(),

                name:
                    name,

                location:
                    location,

                capacity:
                    capacity,

                available:
                    true

            };


            venues.push(venue);

            save();

            showVenues();

            venueOptions();

            updateCounts();

            venueForm.reset();

            msg(
                "Venue added successfully.",
                "success"
            );

        }
    );
}


// =====================================================
// VENUE ASSIGNMENT
// =====================================================

const venueAssignmentForm =
    $("venueAssignmentForm");

if (venueAssignmentForm) {

    venueAssignmentForm.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            const eventId =
                Number(
                    $("eventSelect").value
                );

            const venueId =
                Number(
                    $("venueSelect").value
                );


            if (!eventId || !venueId) {

                msg(
                    "Please select both event and venue.",
                    "error"
                );

                return;
            }


            const event =
                events.find(
                    item =>
                        Number(item.id)
                            === eventId
                );

            const venue =
                venues.find(
                    item =>
                        Number(item.id)
                            === venueId
                );


            if (!event || !venue) {

                msg(
                    "Event or venue not found.",
                    "error"
                );

                return;
            }


            // -----------------------------------------
            // CAPACITY CHECK
            // -----------------------------------------

            if (
                Number(event.participants)
                    > Number(venue.capacity)
            ) {

                msg(
                    "Venue capacity is not enough for this event.",
                    "error"
                );

                return;
            }


            // -----------------------------------------
            // CONFLICT CHECK
            // -----------------------------------------

            const conflict =
                events.some(
                    otherEvent =>

                        Number(otherEvent.id)
                            !== eventId &&

                        otherEvent.venue
                            === venue.name &&

                        otherEvent.date
                            === event.date &&

                        otherEvent.time
                            === event.time
                );


            if (conflict) {

                msg(
                    "This venue is already assigned to another event at the same date and time.",
                    "error"
                );

                return;
            }


            event.venue =
                venue.name;


            save();

            showEvents();

            msg(
                "Venue assigned successfully.",
                "success"
            );

        }
    );
}


// =====================================================
// RESOURCE OPTIONS
// =====================================================

function resourceOptions() {

    const select =
        $("resourceSelect");

    if (!select) {
        return;
    }

    const currentValue =
        select.value;

    select.innerHTML =
        `<option value="">
            Select Resource
        </option>`;

    resources.forEach(resource => {

        const option =
            document.createElement("option");

        option.value =
            resource.id;

        option.textContent =
            `${resource.name} - Available: ${resource.quantity}`;

        select.appendChild(option);

    });

    if (currentValue) {

        select.value =
            currentValue;
    }
}


// =====================================================
// SHOW RESOURCES
// =====================================================

function showResources() {

    const list =
        $("resourceList");

    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (resources.length === 0) {

        list.innerHTML =
            `<p class="empty-message">
                No resources added yet.
            </p>`;

        return;
    }

    resources.forEach(resource => {

        const card =
            document.createElement("div");

        card.className =
            "item-card";

        card.innerHTML = `

            <h3>
                ${escapeHTML(resource.name)}
            </h3>

            <p>
                <strong>Available Quantity:</strong>
                ${resource.quantity}
            </p>

        `;

        list.appendChild(card);

    });
}


// =====================================================
// RESOURCE CREATION
// =====================================================

const resourceForm =
    $("resourceForm");

if (resourceForm) {

    resourceForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            const name =
                $("resourceName")
                    .value
                    .trim();

            const quantity =
                Number(
                    $("resourceQuantity")
                        .value
                );


            if (!name) {

                msg(
                    "Please enter resource name.",
                    "error"
                );

                return;
            }


            if (quantity <= 0) {

                msg(
                    "Quantity must be greater than zero.",
                    "error"
                );

                return;
            }


            // -----------------------------------------
            // LOCAL STORAGE
            // -----------------------------------------

            const existing =
                resources.find(
                    resource =>
                        resource.name
                            .toLowerCase()
                        ===
                        name.toLowerCase()
                );


            if (existing) {

                existing.quantity +=
                    quantity;

            } else {

                resources.push({

                    id:
                        Date.now(),

                    name:
                        name,

                    quantity:
                        quantity

                });

            }


            save();

            showResources();

            resourceOptions();

            updateCounts();


            // -----------------------------------------
            // BACKEND
            // -----------------------------------------

            const result =
                await apiRequest(
                    "/resources",
                    "POST",
                    {
                        name:
                            name,

                        quantity:
                            quantity
                    }
                );


            if (result.success) {

                msg(
                    "Resource added and synchronized with backend.",
                    "success"
                );

            } else {

                msg(
                    "Resource saved locally.",
                    "success"
                );

            }


            resourceForm.reset();

        }
    );
}


// =====================================================
// RESOURCE ALLOCATION
// =====================================================

const resourceAllocationForm =
    $("resourceAllocationForm");

if (resourceAllocationForm) {

    resourceAllocationForm.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            const eventId =
                Number(
                    $("resourceEvent").value
                );

            const resourceId =
                Number(
                    $("resourceSelect").value
                );

            const requiredQuantity =
                Number(
                    $("requiredQuantity").value
                );


            if (
                !eventId ||
                !resourceId
            ) {

                msg(
                    "Please select event and resource.",
                    "error"
                );

                return;
            }


            if (requiredQuantity <= 0) {

                msg(
                    "Required quantity must be greater than zero.",
                    "error"
                );

                return;
            }


            const event =
                events.find(
                    item =>
                        Number(item.id)
                            === eventId
                );

            const resource =
                resources.find(
                    item =>
                        Number(item.id)
                            === resourceId
                );


            if (!event || !resource) {

                msg(
                    "Event or resource not found.",
                    "error"
                );

                return;
            }


            if (
                resource.quantity
                    < requiredQuantity
            ) {

                msg(
                    "Not enough resource quantity available.",
                    "error"
                );

                return;
            }


            resource.quantity -=
                requiredQuantity;


            if (!event.resources) {

                event.resources = [];

            }


            event.resources.push({

                name:
                    resource.name,

                quantity:
                    requiredQuantity

            });


            save();

            showResources();

            resourceOptions();

            msg(
                "Resource allocated successfully.",
                "success"
            );

        }
    );
}


// =====================================================
// REGISTRATION LIST
// =====================================================

function showRegistrations() {

    const list =
        $("registrationList");

    if (!list) {
        return;
    }

    const selectedEvent =
        $("registrationEventFilter")
            ? $("registrationEventFilter").value
            : "";


    let filtered =
        attendees;


    if (selectedEvent) {

        filtered =
            attendees.filter(
                attendee =>
                    Number(attendee.eventId)
                        === Number(selectedEvent)
            );

    }


    list.innerHTML = "";


    if (filtered.length === 0) {

        list.innerHTML =
            `<p class="empty-message">
                No registrations found.
            </p>`;

        return;
    }


    filtered.forEach(attendee => {

        const event =
            events.find(
                item =>
                    Number(item.id)
                        === Number(attendee.eventId)
            );


        const card =
            document.createElement("div");

        card.className =
            "item-card";

        card.innerHTML = `

            <h3>
                ${escapeHTML(attendee.name)}
            </h3>

            <p>
                <strong>Event:</strong>
                ${escapeHTML(
                    event
                        ? event.name
                        : "Unknown"
                )}
            </p>

            <p>
                <strong>Email:</strong>
                ${escapeHTML(attendee.email)}
            </p>

            <p>
                <strong>Ticket:</strong>
                ${escapeHTML(attendee.ticketId)}
            </p>

            <p>
                <strong>Status:</strong>
                ${escapeHTML(attendee.status)}
            </p>

        `;

        list.appendChild(card);

    });
}


// =====================================================
// ATTENDANCE
// =====================================================

const attendanceForm =
    $("attendanceForm");

if (attendanceForm) {

    attendanceForm.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            const ticket =
                $("attendanceTicket")
                    .value
                    .trim();

            const message =
                $("attendanceMessage");


            const attendee =
                attendees.find(
                    item =>
                        item.ticketId
                            === ticket
                );


            if (!attendee) {

                message.textContent =
                    "Invalid ticket ID.";

                message.className =
                    "error-message";

                return;
            }


            if (
                attendee.status
                    === "Checked In"
            ) {

                message.textContent =
                    "Participant is already checked in.";

                message.className =
                    "error-message";

                return;
            }


            attendee.status =
                "Checked In";


            save();

            message.textContent =
                "Attendance marked successfully.";

            message.className =
                "success-message";

            updateCounts();

        }
    );
}


// =====================================================
// VENDOR OPTIONS
// =====================================================

function vendorOptions() {

    const select =
        $("vendorSelect");

    if (!select) {
        return;
    }

    const currentValue =
        select.value;

    select.innerHTML =
        `<option value="">
            Select Vendor
        </option>`;

    vendors.forEach(vendor => {

        const option =
            document.createElement("option");

        option.value =
            vendor.id;

        option.textContent =
            `${vendor.name} - ${vendor.service}`;

        select.appendChild(option);

    });

    if (currentValue) {

        select.value =
            currentValue;
    }
}


// =====================================================
// SHOW VENDORS
// =====================================================

function showVendors() {

    const list =
        $("vendorList");

    if (!list) {
        return;
    }

    list.innerHTML = "";

    if (vendors.length === 0) {

        list.innerHTML =
            `<p class="empty-message">
                No vendors added yet.
            </p>`;

        return;
    }


    vendors.forEach(vendor => {

        const card =
            document.createElement("div");

        card.className =
            "item-card";

        card.innerHTML = `

            <h3>
                ${escapeHTML(vendor.name)}
            </h3>

            <p>
                <strong>Service:</strong>
                ${escapeHTML(vendor.service)}
            </p>

            <p>
                <strong>Phone:</strong>
                ${escapeHTML(vendor.phone)}
            </p>

            <p>
                <strong>Email:</strong>
                ${escapeHTML(vendor.email)}
            </p>

            <p>
                <strong>Rating:</strong>
                ${vendor.rating || 0}
            </p>

        `;

        list.appendChild(card);

    });
}


// =====================================================
// VENDOR CREATION
// =====================================================

const vendorForm =
    $("vendorForm");

if (vendorForm) {

    vendorForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            const name =
                $("vendorName")
                    .value
                    .trim();

            const service =
                $("vendorService")
                    .value
                    .trim();

            const phone =
                $("vendorPhone")
                    .value
                    .trim();

            const email =
                $("vendorEmail")
                    .value
                    .trim();


            if (!name) {

                msg(
                    "Please enter vendor name.",
                    "error"
                );

                return;
            }


            if (!/^\d{10}$/.test(phone)) {

                msg(
                    "Vendor phone number must contain exactly 10 digits.",
                    "error"
                );

                return;
            }


            const duplicateEmail =
                vendors.some(
                    vendor =>
                        vendor.email
                            .toLowerCase()
                        ===
                        email.toLowerCase()
                );


            if (duplicateEmail) {

                msg(
                    "Vendor email already exists.",
                    "error"
                );

                return;
            }


            const vendor = {

                id:
                    Date.now(),

                name:
                    name,

                service:
                    service,

                phone:
                    phone,

                email:
                    email,

                rating:
                    0

            };


            vendors.push(vendor);

            save();

            showVendors();

            vendorOptions();

            updateCounts();


            // -----------------------------------------
            // BACKEND
            // -----------------------------------------

            const result =
                await apiRequest(
                    "/vendors",
                    "POST",
                    {
                        name:
                            name,

                        service:
                            service,

                        phone:
                            phone,

                        email:
                            email,

                        rating:
                            0
                    }
                );


            if (result.success) {

                msg(
                    "Vendor added and synchronized with backend.",
                    "success"
                );

            } else {

                msg(
                    "Vendor saved locally.",
                    "success"
                );

            }


            vendorForm.reset();

        }
    );
}


// =====================================================
// VENDOR ASSIGNMENT
// =====================================================

const vendorAssignmentForm =
    $("vendorAssignmentForm");

if (vendorAssignmentForm) {

    vendorAssignmentForm.addEventListener(
        "submit",
        function (e) {

            e.preventDefault();


            const eventId =
                Number(
                    $("vendorEvent").value
                );

            const vendorId =
                Number(
                    $("vendorSelect").value
                );

            const service =
                $("vendorAssignmentService")
                    .value
                    .trim();


            if (!eventId || !vendorId) {

                msg(
                    "Please select event and vendor.",
                    "error"
                );

                return;
            }


            const event =
                events.find(
                    item =>
                        Number(item.id)
                            === eventId
                );

            const vendor =
                vendors.find(
                    item =>
                        Number(item.id)
                            === vendorId
                );


            if (!event || !vendor) {

                msg(
                    "Event or vendor not found.",
                    "error"
                );

                return;
            }


            assignments.push({

                id:
                    Date.now(),

                eventId:
                    eventId,

                vendorId:
                    vendorId,

                service:
                    service ||
                    vendor.service,

                status:
                    "Assigned"

            });


            save();

            showAssignments();

            msg(
                "Vendor assigned successfully.",
                "success"
            );

        }
    );
}


// =====================================================
// SHOW VENDOR ASSIGNMENTS
// =====================================================

function showAssignments() {

    const list =
        $("assignmentList");

    if (!list) {
        return;
    }

    list.innerHTML = "";


    if (assignments.length === 0) {

        list.innerHTML =
            `<p class="empty-message">
                No vendor assignments yet.
            </p>`;

        return;
    }


    assignments.forEach(assignment => {

        const event =
            events.find(
                item =>
                    Number(item.id)
                        === Number(assignment.eventId)
            );

        const vendor =
            vendors.find(
                item =>
                    Number(item.id)
                        === Number(assignment.vendorId)
            );


        const card =
            document.createElement("div");

        card.className =
            "item-card";


        card.innerHTML = `

            <h3>
                ${escapeHTML(
                    event
                        ? event.name
                        : "Unknown Event"
                )}
            </h3>

            <p>
                <strong>Vendor:</strong>
                ${escapeHTML(
                    vendor
                        ? vendor.name
                        : "Unknown Vendor"
                )}
            </p>

            <p>
                <strong>Service:</strong>
                ${escapeHTML(
                    assignment.service
                )}
            </p>

            <p>
                <strong>Status:</strong>
                ${escapeHTML(
                    assignment.status
                )}
            </p>

        `;


        list.appendChild(card);

    });
}


// =====================================================
// REPORT
// =====================================================

function report() {

    const output =
        $("report");

    if (!output) {
        return;
    }


    const checkedIn =
        attendees.filter(
            attendee =>
                attendee.status
                    === "Checked In"
        ).length;


    let html = `

        <h3>EventSphere Report</h3>

        <p>
            <strong>Total Events:</strong>
            ${events.length}
        </p>

        <p>
            <strong>Total Registrations:</strong>
            ${attendees.length}
        </p>

        <p>
            <strong>Checked In:</strong>
            ${checkedIn}
        </p>

        <p>
            <strong>Total Vendors:</strong>
            ${vendors.length}
        </p>

        <p>
            <strong>Total Vendor Assignments:</strong>
            ${assignments.length}
        </p>

        <hr>

        <h3>Event Details</h3>

    `;


    if (events.length === 0) {

        html +=
            `<p>No events available.</p>`;

    } else {

        events.forEach(event => {

            const registrations =
                attendees.filter(
                    attendee =>
                        Number(attendee.eventId)
                            === Number(event.id)
                ).length;


            html += `

                <div class="item-card">

                    <h4>
                        ${escapeHTML(event.name)}
                    </h4>

                    <p>
                        Date:
                        ${escapeHTML(event.date)}
                    </p>

                    <p>
                        Venue:
                        ${escapeHTML(event.venue)}
                    </p>

                    <p>
                        Budget:
                        ₹${Number(
                            event.budget || 0
                        ).toLocaleString()}
                    </p>

                    <p>
                        Registrations:
                        ${registrations}
                    </p>

                </div>

            `;

        });

    }


    output.innerHTML =
        html;
}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// BACKEND STATUS CHECK
// =====================================================

async function checkBackendConnection() {

    const result =
        await apiRequest(
            "/health"
        );

    if (result.success) {

        console.log(
            "EventSphere backend connected."
        );

        return true;

    }

    console.log(
        "EventSphere backend is not available."
    );

    return false;
}


// =====================================================
// INITIALIZE DASHBOARD
// =====================================================

function initializeDashboard() {

    eventOptions();

    venueOptions();

    resourceOptions();

    vendorOptions();

    showEvents();

    showVenues();

    showResources();

    showVendors();

    showAssignments();

    updateCounts();

    checkBackendConnection();

}


// =====================================================
// DOM READY
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);