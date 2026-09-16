/* =========================================================
   EVENTSPHERE - EVENT INSIGHTS
   Milestone 4 Analytics & Optimization
   ========================================================= */


/* ================= API CONFIGURATION ================= */

const API = "http://127.0.0.1:5000/api";


/* ================= GLOBAL DATA ================= */

let events = [];
let attendees = [];
let resources = [];
let expenses = [];
let sponsors = [];
let approvals = [];

let selectedEvent = null;


/* ================= HELPER ================= */

const $ = (id) => document.getElementById(id);


/* ================= ESCAPE HTML ================= */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ================= API REQUEST ================= */

async function apiRequest(
    endpoint,
    method = "GET",
    data = null
) {

    try {

        const options = {
            method: method,
            headers: {
                "Content-Type": "application/json"
            }
        };


        if (data !== null) {

            options.body =
                JSON.stringify(data);

        }


        const response =
            await fetch(API + endpoint, options);


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.error ||
                "Server request failed"
            );

        }


        return result;

    }

    catch (error) {

        console.error(
            "API Error:",
            error
        );

        return null;

    }

}


/* =========================================================
   LOAD EVENTS
   ========================================================= */

async function loadEvents() {

    const result =
        await apiRequest("/events");


    if (Array.isArray(result)) {

        events = result;

    }

    else {

        events =
            JSON.parse(
                localStorage.getItem("events")
            ) || [];

    }


    populateEventSelector();

    renderEventComparison();

    calculateOverallAnalytics();

}


/* =========================================================
   LOAD ATTENDEES
   ========================================================= */

async function loadAttendees() {

    const result =
        await apiRequest("/attendees");


    if (Array.isArray(result)) {

        attendees = result;

    }

    else {

        attendees =
            JSON.parse(
                localStorage.getItem("attendees")
            ) || [];

    }


    calculateOverallAnalytics();

    renderEventComparison();

}


/* =========================================================
   LOAD RESOURCES
   ========================================================= */

async function loadResources() {

    const result =
        await apiRequest("/resources");


    if (Array.isArray(result)) {

        resources = result;

    }

    else {

        resources =
            JSON.parse(
                localStorage.getItem("resources")
            ) || [];

    }


    calculateResourceUtilization();

}


/* =========================================================
   LOAD APPROVALS
   ========================================================= */

async function loadApprovals() {

    const result =
        await apiRequest("/approvals");


    if (Array.isArray(result)) {

        approvals = result;

    }

    else {

        approvals = [];

    }


    calculateOverallAnalytics();

}


/* =========================================================
   LOAD SPONSORS
   ========================================================= */

async function loadSponsors() {

    const result =
        await apiRequest("/sponsors");


    if (Array.isArray(result)) {

        sponsors = result;

    }

    else {

        sponsors = [];

    }


    calculateOverallAnalytics();

}


/* =========================================================
   LOAD ALL EXPENSES
   ========================================================= */

async function loadExpenses() {

    const result =
        await apiRequest("/expenses");


    if (Array.isArray(result)) {

        expenses = result;

    }

    else {

        expenses = [];

    }


    calculateOverallAnalytics();

    renderEventComparison();

}


/* =========================================================
   POPULATE EVENT SELECTOR
   ========================================================= */

function populateEventSelector() {

    const selector =
        $("eventSelector");


    if (!selector) {
        return;
    }


    selector.innerHTML = `

        <option value="">
            Select Event
        </option>

    `;


    events.forEach(event => {

        const option =
            document.createElement("option");


        option.value =
            event.id;


        option.textContent =
            event.name;


        selector.appendChild(option);

    });

}


/* =========================================================
   EVENT SELECTION
   ========================================================= */

function handleEventSelection() {

    const selector =
        $("eventSelector");


    if (!selector) {
        return;
    }


    const eventId =
        Number(selector.value);


    if (!eventId) {

        selectedEvent = null;

        resetSelectedEvent();

        return;

    }


    selectedEvent =
        events.find(
            event =>
                Number(event.id) === eventId
        );


    if (!selectedEvent) {
        return;
    }


    loadSelectedEventAnalytics(
        selectedEvent
    );

}


/* =========================================================
   LOAD SELECTED EVENT ANALYTICS
   ========================================================= */

async function loadSelectedEventAnalytics(event) {

    const eventId =
        Number(event.id);


    const eventAttendees =
        attendees.filter(
            attendee =>
                Number(
                    attendee.event_id ??
                    attendee.eventId
                ) === eventId
        );


    const registrations =
        eventAttendees.length;


    const checkedIn =
        eventAttendees.filter(
            attendee =>
                String(
                    attendee.status || ""
                ).toLowerCase()
                === "checked in"
        ).length;


    const capacity =
        Number(
            event.participants ??
            event.capacity ??
            0
        );


    const attendanceRate =
        registrations > 0
            ? (checkedIn / registrations) * 100
            : 0;


    const budgetResult =
        await apiRequest(
            `/budget/${eventId}`
        );


    let budget = 0;

    let eventExpenses = 0;

    let remaining = 0;

    let utilization = 0;


    if (budgetResult) {

        budget =
            Number(
                budgetResult.budget || 0
            );


        eventExpenses =
            Number(
                budgetResult.total_expenses ||
                budgetResult.expenses ||
                0
            );


        remaining =
            Number(
                budgetResult.remaining || 0
            );


        utilization =
            Number(
                budgetResult.utilization || 0
            );

    }

    else {

        budget =
            Number(
                event.budget || 0
            );


        eventExpenses =
            expenses
                .filter(
                    expense =>
                        Number(
                            expense.event_id ??
                            expense.eventId
                        ) === eventId
                )
                .reduce(
                    (
                        total,
                        expense
                    ) =>
                        total +
                        Number(
                            expense.amount || 0
                        ),
                    0
                );


        remaining =
            budget -
            eventExpenses;


        utilization =
            budget > 0
                ? (
                    eventExpenses /
                    budget
                ) * 100
                : 0;

    }


    $("selectedRegistrations").textContent =
        registrations;


    $("selectedAttendance").textContent =
        checkedIn;


    $("selectedAttendanceRate").textContent =
        formatPercentage(
            attendanceRate
        );


    $("selectedCapacity").textContent =
        capacity;


    $("financeBudget").textContent =
        formatCurrency(budget);


    $("financeExpenses").textContent =
        formatCurrency(eventExpenses);


    $("financeRemaining").textContent =
        formatCurrency(remaining);


    $("financeUtilization").textContent =
        formatPercentage(
            utilization
        );


    renderAttendanceChart(
        registrations,
        checkedIn
    );


    renderBudgetChart(
        budget,
        eventExpenses
    );


    generateOptimizationRecommendations(
        event,
        registrations,
        checkedIn,
        capacity,
        budget,
        eventExpenses,
        utilization
    );


    generateAttendanceForecast(
        registrations,
        checkedIn,
        capacity
    );

}


/* =========================================================
   RESET EVENT
   ========================================================= */

function resetSelectedEvent() {

    $("selectedRegistrations").textContent =
        "0";


    $("selectedAttendance").textContent =
        "0";


    $("selectedAttendanceRate").textContent =
        "0%";


    $("selectedCapacity").textContent =
        "0";


    $("financeBudget").textContent =
        "₹0";


    $("financeExpenses").textContent =
        "₹0";


    $("financeRemaining").textContent =
        "₹0";


    $("financeUtilization").textContent =
        "0%";


    $("attendanceChart").innerHTML = `

        <div class="analytics-empty">
            Select an event to view attendance data.
        </div>

    `;


    $("budgetChart").innerHTML = `

        <div class="analytics-empty">
            Select an event to view financial data.
        </div>

    `;


    $("budgetRecommendation").textContent =
        "Select an event to receive budget recommendations.";


    $("attendanceRecommendation").textContent =
        "Select an event to receive attendance recommendations.";


    $("resourceRecommendation").textContent =
        "Select an event to receive resource recommendations.";


    $("venueRecommendation").textContent =
        "Select an event to receive venue recommendations.";


    $("forecastAttendance").textContent =
        "0";


    $("forecastRate").textContent =
        "0%";


    $("forecastMessage").textContent =
        "Select an event to view the attendance forecast.";

}


/* =========================================================
   OVERALL ANALYTICS
   ========================================================= */

async function calculateOverallAnalytics() {

    const totalEvents =
        events.length;


    const totalRegistrations =
        attendees.length;


    const checkedIn =
        attendees.filter(
            attendee =>
                String(
                    attendee.status || ""
                ).toLowerCase()
                === "checked in"
        ).length;


    const attendanceRate =
        totalRegistrations > 0
            ? (
                checkedIn /
                totalRegistrations
            ) * 100
            : 0;


    const totalBudget =
        events.reduce(
            (
                total,
                event
            ) =>
                total +
                Number(
                    event.budget || 0
                ),
            0
        );


    const totalExpenses =
        expenses.reduce(
            (
                total,
                expense
            ) =>
                total +
                Number(
                    expense.amount || 0
                ),
            0
        );


    const totalSponsorship =
        sponsors.reduce(
            (
                total,
                sponsor
            ) =>
                total +
                Number(
                    sponsor.amount || 0
                ),
            0
        );


    const pendingApprovals =
        approvals.filter(
            approval =>
                String(
                    approval.status || ""
                ).toLowerCase()
                === "pending"
        ).length;


    $("totalEvents").textContent =
        totalEvents;


    $("totalRegistrations").textContent =
        totalRegistrations;


    $("attendanceRate").textContent =
        formatPercentage(
            attendanceRate
        );


    $("totalBudget").textContent =
        formatCurrency(
            totalBudget
        );


    $("totalExpenses").textContent =
        formatCurrency(
            totalExpenses
        );


    $("totalSponsorship").textContent =
        formatCurrency(
            totalSponsorship
        );


    $("pendingApprovals").textContent =
        pendingApprovals;


    calculateResourceUtilization();

}


/* =========================================================
   RESOURCE UTILIZATION
   ========================================================= */

function calculateResourceUtilization() {

    if (!resources.length) {

        $("resourceUtilization").textContent =
            "0%";

        renderResourceInsights();

        return;

    }


    let totalAvailable = 0;

    let totalUsed = 0;


    resources.forEach(resource => {

        const quantity =
            Number(
                resource.quantity || 0
            );


        const used =
            Number(
                resource.used ||
                resource.allocated ||
                0
            );


        totalAvailable +=
            quantity;


        totalUsed +=
            used;

    });


    let utilization = 0;


    if (totalAvailable > 0) {

        utilization =
            (
                totalUsed /
                totalAvailable
            ) * 100;

    }


    $("resourceUtilization").textContent =
        formatPercentage(
            utilization
        );


    renderResourceInsights();

}


/* =========================================================
   RESOURCE INSIGHTS
   ========================================================= */

function renderResourceInsights() {

    const container =
        $("resourceInsights");


    if (!container) {
        return;
    }


    if (!resources.length) {

        container.innerHTML = `

            <div class="analytics-empty">

                No resource information
                is available yet.

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    resources.forEach(resource => {

        const quantity =
            Number(
                resource.quantity || 0
            );


        const used =
            Number(
                resource.used ||
                resource.allocated ||
                0
            );


        let percentage = 0;


        if (quantity > 0) {

            percentage =
                (
                    used /
                    quantity
                ) * 100;

        }


        percentage =
            Math.min(
                100,
                percentage
            );


        const card =
            document.createElement("div");


        card.className =
            "resource-card";


        card.innerHTML = `

            <h3>
                ${escapeHTML(resource.name)}
            </h3>

            <p>
                Available:
                ${quantity}
            </p>

            <p>
                Used:
                ${used}
            </p>

            <div class="resource-progress">

                <div
                    class="resource-progress-bar"
                    style="width:${percentage}%"
                ></div>

            </div>

            <p>
                Utilization:
                ${formatPercentage(percentage)}
            </p>

        `;


        container.appendChild(card);

    });

}


/* =========================================================
   ATTENDANCE CHART
   ========================================================= */

function renderAttendanceChart(
    registrations,
    checkedIn
) {

    const chart =
        $("attendanceChart");


    if (!chart) {
        return;
    }


    const maximum =
        Math.max(
            registrations,
            checkedIn,
            1
        );


    const registrationHeight =
        (
            registrations /
            maximum
        ) * 100;


    const checkedInHeight =
        (
            checkedIn /
            maximum
        ) * 100;


    chart.innerHTML = `

        <div class="chart-bar-group">

            <div
                class="chart-bar"
                style="height:${registrationHeight}%"
            >

                <span class="chart-bar-value">
                    ${registrations}
                </span>

                <span class="chart-bar-label">
                    Registrations
                </span>

            </div>


            <div
                class="chart-bar secondary"
                style="height:${checkedInHeight}%"
            >

                <span class="chart-bar-value">
                    ${checkedIn}
                </span>

                <span class="chart-bar-label">
                    Checked In
                </span>

            </div>

        </div>

    `;

}


/* =========================================================
   BUDGET CHART
   ========================================================= */

function renderBudgetChart(
    budget,
    expenses
) {

    const chart =
        $("budgetChart");


    if (!chart) {
        return;
    }


    const maximum =
        Math.max(
            budget,
            expenses,
            1
        );


    const budgetPercentage =
        (
            budget /
            maximum
        ) * 100;


    const expensePercentage =
        (
            expenses /
            maximum
        ) * 100;


    chart.innerHTML = `

        <div class="budget-row">

            <div class="budget-row-label">
                Budget
            </div>

            <div class="budget-track">

                <div
                    class="budget-fill"
                    style="width:${budgetPercentage}%"
                ></div>

            </div>

            <div class="budget-row-value">
                ${formatCurrency(budget)}
            </div>

        </div>


        <div class="budget-row">

            <div class="budget-row-label">
                Expenses
            </div>

            <div class="budget-track">

                <div
                    class="budget-fill expense"
                    style="width:${expensePercentage}%"
                ></div>

            </div>

            <div class="budget-row-value">
                ${formatCurrency(expenses)}
            </div>

        </div>

    `;

}


/* =========================================================
   EVENT COMPARISON
   ========================================================= */

async function renderEventComparison() {

    const table =
        $("comparisonTable");


    if (!table) {
        return;
    }


    if (!events.length) {

        table.innerHTML = `

            <tr>

                <td colspan="6">
                    No events available.
                </td>

            </tr>

        `;

        return;

    }


    table.innerHTML = "";


    for (
        const event of events
    ) {

        const eventId =
            Number(event.id);


        const eventAttendees =
            attendees.filter(
                attendee =>
                    Number(
                        attendee.event_id ??
                        attendee.eventId
                    ) === eventId
            );


        const registrations =
            eventAttendees.length;


        const checkedIn =
            eventAttendees.filter(
                attendee =>
                    String(
                        attendee.status || ""
                    ).toLowerCase()
                    === "checked in"
            ).length;


        const attendanceRate =
            registrations > 0
                ? (
                    checkedIn /
                    registrations
                ) * 100
                : 0;


        const eventExpenses =
            expenses
                .filter(
                    expense =>
                        Number(
                            expense.event_id ??
                            expense.eventId
                        ) === eventId
                )
                .reduce(
                    (
                        total,
                        expense
                    ) =>
                        total +
                        Number(
                            expense.amount || 0
                        ),
                    0
                );


        const budget =
            Number(
                event.budget || 0
            );


        const row =
            document.createElement("tr");


        row.innerHTML = `

            <td>
                <strong>
                    ${escapeHTML(event.name)}
                </strong>
            </td>

            <td>
                ${registrations}
            </td>

            <td>
                ${checkedIn}
            </td>

            <td>
                ${formatPercentage(attendanceRate)}
            </td>

            <td>
                ${formatCurrency(budget)}
            </td>

            <td>
                ${formatCurrency(eventExpenses)}
            </td>

        `;


        table.appendChild(row);

    }

}


/* =========================================================
   OPTIMIZATION RECOMMENDATIONS
   ========================================================= */

function generateOptimizationRecommendations(
    event,
    registrations,
    checkedIn,
    capacity,
    budget,
    eventExpenses,
    utilization
) {


    /* ---------- BUDGET ---------- */

    if (budget <= 0) {

        $("budgetRecommendation").textContent =
            "Add an event budget to generate financial recommendations.";

    }

    else if (utilization >= 90) {

        $("budgetRecommendation").textContent =
            "Spending is above 90% of the planned budget. Review remaining expenses and prioritize essential activities.";

    }

    else if (utilization >= 75) {

        $("budgetRecommendation").textContent =
            "Budget utilization is high. Monitor upcoming expenses carefully to avoid exceeding the planned budget.";

    }

    else {

        $("budgetRecommendation").textContent =
            "Budget usage is currently under control. Continue monitoring expenses against the planned budget.";

    }


    /* ---------- ATTENDANCE ---------- */

    const attendanceRate =
        registrations > 0
            ? (
                checkedIn /
                registrations
            ) * 100
            : 0;


    if (registrations === 0) {

        $("attendanceRecommendation").textContent =
            "No registrations are available. Promote the event to increase participation.";

    }

    else if (attendanceRate < 50) {

        $("attendanceRecommendation").textContent =
            "Attendance is below 50%. Consider sending reminders and improving participant communication.";

    }

    else if (attendanceRate < 75) {

        $("attendanceRecommendation").textContent =
            "Attendance is moderate. Automated reminders can help improve participant turnout.";

    }

    else {

        $("attendanceRecommendation").textContent =
            "Attendance performance is strong. Continue using reminders and clear event communication.";

    }


    /* ---------- RESOURCE ---------- */

    if (!resources.length) {

        $("resourceRecommendation").textContent =
            "Add resources to the event system to receive utilization recommendations.";

    }

    else {

        $("resourceRecommendation").textContent =
            "Review frequently used resources and allocate quantities according to participant requirements.";

    }


    /* ---------- VENUE ---------- */

    if (capacity <= 0) {

        $("venueRecommendation").textContent =
            "Set the participant capacity to evaluate venue suitability.";

    }

    else if (
        registrations >
        capacity
    ) {

        $("venueRecommendation").textContent =
            "Registrations have exceeded venue capacity. Consider assigning a larger venue.";

    }

    else if (
        registrations >=
        capacity * 0.8
    ) {

        $("venueRecommendation").textContent =
            "Venue utilization is high. Monitor additional registrations carefully.";

    }

    else {

        $("venueRecommendation").textContent =
            "The current venue has sufficient capacity for the registered participants.";

    }

}


/* =========================================================
   ATTENDANCE FORECAST
   ========================================================= */

function generateAttendanceForecast(
    registrations,
    checkedIn,
    capacity
) {

    if (registrations <= 0) {

        $("forecastAttendance").textContent =
            "0";


        $("forecastRate").textContent =
            "0%";


        $("forecastMessage").textContent =
            "More registration data is required to generate an attendance forecast.";

        return;

    }


    let historicalRate = 0;


    if (checkedIn > 0) {

        historicalRate =
            checkedIn /
            registrations;

    }

    else {

        /*
         * Basic fallback assumption:
         * expected attendance = 75%
         * of registered participants.
         */

        historicalRate =
            0.75;

    }


    let forecast =
        Math.round(
            registrations *
            historicalRate
        );


    if (capacity > 0) {

        forecast =
            Math.min(
                forecast,
                capacity
            );

    }


    const forecastRate =
        registrations > 0
            ? (
                forecast /
                registrations
            ) * 100
            : 0;


    $("forecastAttendance").textContent =
        forecast;


    $("forecastRate").textContent =
        formatPercentage(
            forecastRate
        );


    if (forecastRate >= 80) {

        $("forecastMessage").textContent =
            "The event is expected to have strong attendance. Continue participant engagement and reminder activities.";

    }

    else if (forecastRate >= 60) {

        $("forecastMessage").textContent =
            "The event has a moderate expected attendance. Additional reminders may improve turnout.";

    }

    else {

        $("forecastMessage").textContent =
            "Expected attendance is relatively low. Consider increasing participant engagement before the event.";

    }

}


/* =========================================================
   CSV REPORT
   ========================================================= */

function generateCSV() {

    if (!events.length) {

        showAnalyticsMessage(
            "No event data available for export.",
            "error"
        );

        return;

    }


    let csv =
        "Event,Registrations,Attendance,Attendance Rate,Budget,Expenses\n";


    events.forEach(event => {

        const eventId =
            Number(event.id);


        const eventAttendees =
            attendees.filter(
                attendee =>
                    Number(
                        attendee.event_id ??
                        attendee.eventId
                    ) === eventId
            );


        const registrations =
            eventAttendees.length;


        const checkedIn =
            eventAttendees.filter(
                attendee =>
                    String(
                        attendee.status || ""
                    ).toLowerCase()
                    === "checked in"
            ).length;


        const attendanceRate =
            registrations > 0
                ? (
                    checkedIn /
                    registrations
                ) * 100
                : 0;


        const budget =
            Number(
                event.budget || 0
            );


        const eventExpenses =
            expenses
                .filter(
                    expense =>
                        Number(
                            expense.event_id ??
                            expense.eventId
                        ) === eventId
                )
                .reduce(
                    (
                        total,
                        expense
                    ) =>
                        total +
                        Number(
                            expense.amount || 0
                        ),
                    0
                );


        const safeName =
            String(
                event.name || ""
            )
            .replace(
                /"/g,
                '""'
            );


        csv +=
            `"${safeName}",` +
            `${registrations},` +
            `${checkedIn},` +
            `${attendanceRate.toFixed(2)}%,` +
            `${budget},` +
            `${eventExpenses}\n`;

    });


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href =
        url;


    link.download =
        "eventsphere_event_insights.csv";


    document.body.appendChild(link);


    link.click();


    document.body.removeChild(link);


    URL.revokeObjectURL(url);


    showAnalyticsMessage(
        "Event insights CSV exported successfully.",
        "success"
    );

}


/* =========================================================
   PDF / PRINT
   ========================================================= */

function generatePDF() {

    window.print();

}


/* =========================================================
   MESSAGE
   ========================================================= */

function showAnalyticsMessage(
    text,
    type = "success"
) {

    const message =
        $("analyticsMessage");


    if (!message) {
        return;
    }


    message.style.display =
        "block";


    message.textContent =
        text;


    if (type === "error") {

        message.style.background =
            "#fee2e2";

        message.style.color =
            "#991b1b";

    }

    else {

        message.style.background =
            "#dcfce7";

        message.style.color =
            "#166534";

    }


    setTimeout(() => {

        message.style.display =
            "none";

    }, 3000);

}


/* =========================================================
   FORMATTING
   ========================================================= */

function formatCurrency(amount) {

    return "₹" +
        Number(
            amount || 0
        ).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );

}


function formatPercentage(value) {

    return Number(
        value || 0
    ).toFixed(1) + "%";

}


/* =========================================================
   LOAD ANALYTICS
   ========================================================= */

async function loadAnalytics() {

    await Promise.all([

        loadEvents(),

        loadAttendees(),

        loadResources(),

        loadExpenses(),

        loadSponsors(),

        loadApprovals()

    ]);


    calculateOverallAnalytics();

    renderEventComparison();

    calculateResourceUtilization();


    if (selectedEvent) {

        await loadSelectedEventAnalytics(
            selectedEvent
        );

    }


    showAnalyticsMessage(
        "Event insights refreshed successfully.",
        "success"
    );

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {


        /* Event selector */

        const selector =
            $("eventSelector");


        if (selector) {

            selector.addEventListener(
                "change",
                handleEventSelection
            );

        }


        /* Initial empty state */

        resetSelectedEvent();


        /* Load data */

        await Promise.all([

            loadEvents(),

            loadAttendees(),

            loadResources(),

            loadExpenses(),

            loadSponsors(),

            loadApprovals()

        ]);


        /* Final calculations */

        calculateOverallAnalytics();

        renderEventComparison();

        calculateResourceUtilization();

    }
);