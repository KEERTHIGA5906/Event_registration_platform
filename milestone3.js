/* =========================================
   EVENTSPHERE - MILESTONE 3 JAVASCRIPT
   Budget, APIs & Automation
   ========================================= */


/* API BASE URL */

const API =
    "http://127.0.0.1:5000/api";


/* =========================================
   COMMON FUNCTIONS
   ========================================= */

function $(id) {
    return document.getElementById(id);
}


function showMessage(message, type = "success") {

    const box = $("m3Message");

    if (!box) {
        return;
    }

    box.textContent = message;

    if (type === "error") {

        box.style.background = "#fee2e2";
        box.style.color = "#991b1b";

    } else {

        box.style.background = "#dcfce7";
        box.style.color = "#166534";

    }

    setTimeout(() => {

        box.textContent = "";

        box.style.background = "";
        box.style.color = "";

    }, 4000);
}


/* =========================================
   API REQUEST
   ========================================= */

async function apiRequest(url, options = {}) {

    try {

        const response =
            await fetch(API + url, {

                headers: {
                    "Content-Type":
                        "application/json"
                },

                ...options

            });


        let data = {};

        try {

            data = await response.json();

        } catch {

            data = {};

        }


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "API request failed"
            );

        }


        return data;

    } catch (error) {

        console.error(
            "API Error:",
            error
        );

        throw error;
    }
}


/* =========================================
   LOAD EVENTS
   ========================================= */

async function loadEvents() {

    try {

        const data =
            await apiRequest("/events");


        const events =
            data.events || data;


        const selects = [

            $("expenseEvent"),
            $("sponsorEvent"),
            $("approvalEvent")

        ];


        selects.forEach(select => {

            if (!select) {
                return;
            }


            select.innerHTML =
                '<option value="">Select Event</option>';


            events.forEach(event => {

                const option =
                    document.createElement("option");


                option.value =
                    event.id;


                option.textContent =
                    event.name;


                select.appendChild(option);

            });

        });


        $("m3EventCount").textContent =
            events.length;


        return events;

    } catch (error) {

        console.error(
            "Unable to load events:",
            error
        );

        showMessage(
            "Unable to connect to EventSphere API.",
            "error"
        );

        return [];

    }
}


/* =========================================
   LOAD DASHBOARD
   ========================================= */

async function loadDashboard() {

    try {

        const data =
            await apiRequest("/dashboard");


        $("m3EventCount").textContent =
            data.total_events || 0;


        $("m3AttendeeCount").textContent =
            data.total_attendees || 0;


        $("m3ExpenseCount").textContent =
            data.total_expenses || 0;


        $("m3SponsorAmount").textContent =
            "₹" +
            Number(
                data.total_sponsorship || 0
            ).toLocaleString();


        $("m3ApprovalCount").textContent =
            data.pending_approvals || 0;


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }
}


/* =========================================
   LOAD BUDGET
   ========================================= */

async function loadBudget(eventId) {

    if (!eventId) {

        $("budgetSummary").innerHTML =
            "Select an event to view budget.";

        $("expenseList").innerHTML =
            "Select an event to view expenses.";

        return;

    }


    try {

        const data =
            await apiRequest(
                "/budget/" + eventId
            );


        const budget =
            Number(data.budget || 0);


        const expenses =
            Number(data.expenses || 0);


        const remaining =
            Number(data.remaining || 0);


        const utilization =
            Number(
                data.utilization || 0
            );


        const sponsorship =
            Number(
                data.sponsorship || 0
            );


        $("budgetSummary").innerHTML = `

            <div class="budget-grid">

                <div class="budget-card">

                    <span>
                        Total Budget
                    </span>

                    <strong>
                        ${budget.toLocaleString()}
                    </strong>

                </div>


                <div class="budget-card">

                    <span>
                        Total Expenses
                    </span>

                    <strong>
                        ${expenses.toLocaleString()}
                    </strong>

                </div>


                <div class="budget-card">

                    <span>
                        Remaining Budget
                    </span>

                    <strong>
                        ${remaining.toLocaleString()}
                    </strong>

                </div>


                <div class="budget-card">

                    <span>
                        Sponsorship
                    </span>

                    <strong>
                        ₹${sponsorship.toLocaleString()}
                    </strong>

                </div>

            </div>


            <p>
                <strong>
                    Budget Utilization:
                </strong>

                ${utilization.toFixed(2)}%
            </p>


            <div class="progress-container">

                <div
                    class="progress-bar"
                    style="width:${Math.min(
                        utilization,
                        100
                    )}%"
                ></div>

            </div>

        `;


        loadExpenses(eventId);

    } catch (error) {

        $("budgetSummary").innerHTML =
            "Unable to load budget information.";

        console.error(error);

    }
}


/* =========================================
   LOAD EXPENSES
   ========================================= */

async function loadExpenses(eventId) {

    try {

        const data =
            await apiRequest(
                "/expenses?event_id=" +
                eventId
            );


        const expenses =
            data.expenses || data;


        const container =
            $("expenseList");


        if (!expenses.length) {

            container.innerHTML =
                '<div class="empty-message">' +
                'No expenses added for this event.' +
                '</div>';

            return;

        }


        container.innerHTML = "";


        expenses.forEach(expense => {

            const item =
                document.createElement("div");


            item.className =
                "expense-item";


            item.innerHTML = `

                <h3>
                    ${escapeHTML(
                        expense.category
                    )}
                </h3>

                <p>
                    <strong>
                        Description:
                    </strong>

                    ${escapeHTML(
                        expense.description || ""
                    )}
                </p>

                <p>
                    <strong>
                        Amount:
                    </strong>

                    ₹${Number(
                        expense.amount || 0
                    ).toLocaleString()}
                </p>

                <button
                    class="delete-btn"
                    onclick="deleteExpense(${expense.id})"
                >
                    Delete
                </button>

            `;


            container.appendChild(item);

        });

    } catch (error) {

        console.error(
            "Expense loading error:",
            error
        );

    }
}


/* =========================================
   ADD EXPENSE
   ========================================= */

$("expenseForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const eventId =
            $("expenseEvent").value;


        const category =
            $("expenseCategory").value;


        const description =
            $("expenseDescription").value.trim();


        const amount =
            Number(
                $("expenseAmount").value
            );


        if (!eventId) {

            showMessage(
                "Please select an event.",
                "error"
            );

            return;

        }


        if (amount <= 0) {

            showMessage(
                "Expense amount must be greater than zero.",
                "error"
            );

            return;

        }


        try {

            await apiRequest(
                "/expenses",
                {

                    method: "POST",

                    body: JSON.stringify({

                        event_id:
                            Number(eventId),

                        category:
                            category,

                        description:
                            description,

                        amount:
                            amount

                    })

                }
            );


            showMessage(
                "Expense added successfully."
            );


            $("expenseForm").reset();


            $("expenseEvent").value =
                eventId;


            await loadBudget(eventId);

            await loadDashboard();

        } catch (error) {

            showMessage(
                error.message,
                "error"
            );

        }

    }
);


/* =========================================
   DELETE EXPENSE
   ========================================= */

async function deleteExpense(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this expense?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        await apiRequest(
            "/expenses/" + id,
            {
                method: "DELETE"
            }
        );


        showMessage(
            "Expense deleted successfully."
        );


        const eventId =
            $("expenseEvent").value;


        await loadBudget(eventId);

        await loadDashboard();

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );

    }
}


/* =========================================
   LOAD SPONSORS
   ========================================= */

async function loadSponsors() {

    try {

        const data =
            await apiRequest(
                "/sponsors"
            );


        const sponsors =
            data.sponsors || data;


        const container =
            $("sponsorList");


        if (!sponsors.length) {

            container.innerHTML =
                '<div class="empty-message">' +
                'No Sponsors Added Yet.' +
                '</div>';

            return;

        }


        container.innerHTML = "";


        sponsors.forEach(sponsor => {

            const item =
                document.createElement("div");


            item.className =
                "sponsor-item";


            item.innerHTML = `

                <h3>
                    ${escapeHTML(
                        sponsor.name
                    )}
                </h3>

                <p>
                    <strong>
                        Event:
                    </strong>

                    ${escapeHTML(
                        sponsor.event_name ||
                        "Event"
                    )}
                </p>

                <p>
                    <strong>
                        Amount:
                    </strong>

                    ${Number(
                        sponsor.amount || 0
                    ).toLocaleString()}
                </p>

                <p>
                    <strong>
                        Contact:
                    </strong>

                    ${escapeHTML(
                        sponsor.contact || ""
                    )}
                </p>

            `;


            container.appendChild(item);

        });

    } catch (error) {

        console.error(
            "Sponsor loading error:",
            error
        );

    }
}


/* =========================================
   ADD SPONSOR
   ========================================= */

$("sponsorForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const eventId =
            $("sponsorEvent").value;


        const name =
            $("sponsorName").value.trim();


        const amount =
            Number(
                $("sponsorAmount").value
            );


        const contact =
            $("sponsorContact").value.trim();


        if (!eventId) {

            showMessage(
                "Please select an event.",
                "error"
            );

            return;

        }


        if (amount <= 0) {

            showMessage(
                "Sponsorship amount must be greater than zero.",
                "error"
            );

            return;

        }


        try {

            await apiRequest(
                "/sponsors",
                {

                    method: "POST",

                    body: JSON.stringify({

                        event_id:
                            Number(eventId),

                        name:
                            name,

                        amount:
                            amount,

                        contact:
                            contact

                    })

                }
            );


            showMessage(
                "Sponsor added successfully."
            );


            $("sponsorForm").reset();


            await loadSponsors();

            await loadDashboard();

        } catch (error) {

            showMessage(
                error.message,
                "error"
            );

        }

    }
);


/* =========================================
   LOAD APPROVALS
   ========================================= */

async function loadApprovals() {

    try {

        const data =
            await apiRequest(
                "/approvals"
            );


        const approvals =
            data.approvals || data;


        const container =
            $("approvalList");


        if (!approvals.length) {

            container.innerHTML =
                '<div class="empty-message">' +
                'No Approval Requests Yet.' +
                '</div>';

            return;

        }


        container.innerHTML = "";


        approvals.forEach(approval => {

            const item =
                document.createElement("div");


            item.className =
                "approval-item";


            let statusClass =
                "status-pending";


            if (
                approval.status ===
                "Approved"
            ) {

                statusClass =
                    "status-approved";

            } else if (
                approval.status ===
                "Rejected"
            ) {

                statusClass =
                    "status-rejected";

            }


            item.innerHTML = `

                <h3>
                    ${escapeHTML(
                        approval.item
                    )}
                </h3>

                <p>
                    <strong>
                        Event:
                    </strong>

                    ${escapeHTML(
                        approval.event_name ||
                        "Event"
                    )}
                </p>

                <p>
                    <strong>
                        Requested By:
                    </strong>

                    ${escapeHTML(
                        approval.requested_by ||
                        ""
                    )}
                </p>

                <p>

                    <strong>
                        Status:
                    </strong>

                    <span
                        class="status ${statusClass}"
                    >
                        ${escapeHTML(
                            approval.status
                        )}
                    </span>

                </p>


                ${
                    approval.status ===
                    "Pending"

                    ?

                    `

                    <div class="approval-buttons">

                        <button
                            class="approve-btn"
                            onclick="updateApproval(
                                ${approval.id},
                                'Approved'
                            )"
                        >
                            Approve
                        </button>


                        <button
                            class="reject-btn"
                            onclick="updateApproval(
                                ${approval.id},
                                'Rejected'
                            )"
                        >
                            Reject
                        </button>

                    </div>

                    `

                    :

                    ""

                }

            `;


            container.appendChild(item);

        });

    } catch (error) {

        console.error(
            "Approval loading error:",
            error
        );

    }
}


/* =========================================
   ADD APPROVAL
   ========================================= */

$("approvalForm").addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const eventId =
            $("approvalEvent").value;


        const item =
            $("approvalItem").value.trim();


        const requestedBy =
            $("approvalRequestedBy")
                .value
                .trim();


        if (!eventId) {

            showMessage(
                "Please select an event.",
                "error"
            );

            return;

        }


        try {

            await apiRequest(
                "/approvals",
                {

                    method: "POST",

                    body: JSON.stringify({

                        event_id:
                            Number(eventId),

                        item:
                            item,

                        requested_by:
                            requestedBy,

                        status:
                            "Pending"

                    })

                }
            );


            showMessage(
                "Approval request submitted."
            );


            $("approvalForm").reset();


            await loadApprovals();

            await loadDashboard();

        } catch (error) {

            showMessage(
                error.message,
                "error"
            );

        }

    }
);


/* =========================================
   UPDATE APPROVAL
   ========================================= */

async function updateApproval(
    id,
    status
) {

    try {

        await apiRequest(
            "/approvals/" + id,
            {

                method: "PUT",

                body: JSON.stringify({

                    status:
                        status

                })

            }
        );


        showMessage(
            "Approval updated successfully."
        );


        await loadApprovals();

        await loadDashboard();

    } catch (error) {

        showMessage(
            error.message,
            "error"
        );

    }
}


/* =========================================
   LOAD NOTIFICATIONS
   ========================================= */

async function loadNotifications() {

    try {

        const data =
            await apiRequest(
                "/notifications"
            );


        const notifications =
            data.notifications || data;


        const container =
            $("notificationList");


        if (!notifications.length) {

            container.innerHTML =
                '<div class="empty-message">' +
                'No Notifications Yet.' +
                '</div>';

            return;

        }


        container.innerHTML = "";


        notifications.forEach(notification => {

            const item =
                document.createElement("div");


            item.className =
                "notification-item";


            item.innerHTML = `

                <h3>
                    ${escapeHTML(
                        notification.title ||
                        "EventSphere Notification"
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        notification.message ||
                        ""
                    )}
                </p>

            `;


            container.appendChild(item);

        });

    } catch (error) {

        console.error(
            "Notification loading error:",
            error
        );

    }
}


/* =========================================
   EXPENSE EVENT CHANGE
   ========================================= */

$("expenseEvent").addEventListener(
    "change",
    function() {

        loadBudget(
            this.value
        );

    }
);


/* =========================================
   ESCAPE HTML
   ========================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================
   INITIALIZE
   ========================================= */

async function initializeMilestone3() {

    try {

        await loadEvents();

        await loadDashboard();

        await loadSponsors();

        await loadApprovals();

        await loadNotifications();

    } catch (error) {

        console.error(
            "Milestone 3 initialization error:",
            error
        );

    }

}


/* =========================================
   START
   ========================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeMilestone3
);