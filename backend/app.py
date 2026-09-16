from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import os
from datetime import datetime, timedelta


# ---------------------------------------------------------
# FLASK APPLICATION
# ---------------------------------------------------------

app = Flask(__name__)
CORS(app)


# ---------------------------------------------------------
# DATABASE CONFIGURATION
# ---------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DATABASE = os.path.join(DATA_DIR, "eventsphere.db")

os.makedirs(DATA_DIR, exist_ok=True)


# ---------------------------------------------------------
# DATABASE CONNECTION
# ---------------------------------------------------------

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


# ---------------------------------------------------------
# INITIALIZE DATABASE
# ---------------------------------------------------------

def init_db():

    conn = get_db()
    cursor = conn.cursor()

    # EVENTS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT,
            date TEXT,
            time TEXT,
            budget REAL DEFAULT 0,
            participants INTEGER DEFAULT 0,
            venue TEXT DEFAULT 'Not Assigned'
        )
    """)

    # ATTENDEES
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS attendees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reg_id TEXT,
            event_id INTEGER,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            college TEXT,
            department TEXT,
            year TEXT,
            ticket_id TEXT,
            status TEXT DEFAULT 'Registered',
            registration_date TEXT,
            FOREIGN KEY(event_id) REFERENCES events(id)
        )
    """)

    # RESOURCES
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resources (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            quantity INTEGER DEFAULT 0
        )
    """)

    # VENDORS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vendors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            service TEXT,
            phone TEXT,
            email TEXT,
            rating REAL DEFAULT 0
        )
    """)

    # EXPENSES
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            amount REAL NOT NULL,
            created_at TEXT,
            FOREIGN KEY(event_id) REFERENCES events(id)
        )
    """)

    # SPONSORS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sponsors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            amount REAL DEFAULT 0,
            contact TEXT,
            created_at TEXT,
            FOREIGN KEY(event_id) REFERENCES events(id)
        )
    """)

    # APPROVALS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS approvals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            item TEXT NOT NULL,
            requested_by TEXT,
            status TEXT DEFAULT 'Pending',
            created_at TEXT,
            FOREIGN KEY(event_id) REFERENCES events(id)
        )
    """)

    # NOTIFICATIONS
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER,
            type TEXT,
            message TEXT NOT NULL,
            status TEXT DEFAULT 'Unread',
            created_at TEXT,
            FOREIGN KEY(event_id) REFERENCES events(id)
        )
    """)

    conn.commit()
    conn.close()


# Initialize database when application starts
init_db()


# ---------------------------------------------------------
# HELPER FUNCTIONS
# ---------------------------------------------------------

def row_to_dict(row):

    if row is None:
        return None

    return dict(row)


def get_event(event_id):

    conn = get_db()

    event = conn.execute(
        "SELECT * FROM events WHERE id = ?",
        (event_id,)
    ).fetchone()

    conn.close()

    return event


def create_notification(event_id, notification_type, message):

    conn = get_db()

    conn.execute("""
        INSERT INTO notifications
        (event_id, type, message, status, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (
        event_id,
        notification_type,
        message,
        "Unread",
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))

    conn.commit()
    conn.close()


# =========================================================
# HEALTH API
# =========================================================

@app.route("/api/health", methods=["GET"])
def health():

    return jsonify({
        "status": "online",
        "message": "EventSphere API is running"
    }), 200


# =========================================================
# EVENT API
# =========================================================

@app.route("/api/events", methods=["GET"])
def get_events():

    conn = get_db()

    events = conn.execute(
        "SELECT * FROM events ORDER BY id DESC"
    ).fetchall()

    conn.close()

    return jsonify([
        row_to_dict(event)
        for event in events
    ]), 200


@app.route("/api/events", methods=["POST"])
def create_event():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    name = data.get("name")

    if not name:
        return jsonify({
            "error": "Event name is required"
        }), 400

    conn = get_db()

    cursor = conn.execute("""
        INSERT INTO events
        (name, type, date, time, budget, participants, venue)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        name,
        data.get("type", ""),
        data.get("date", ""),
        data.get("time", ""),
        float(data.get("budget", 0)),
        int(data.get("participants", 0)),
        data.get("venue", "Not Assigned")
    ))

    conn.commit()

    event_id = cursor.lastrowid

    event = conn.execute(
        "SELECT * FROM events WHERE id = ?",
        (event_id,)
    ).fetchone()

    conn.close()

    return jsonify({
        "message": "Event created successfully",
        "event": row_to_dict(event)
    }), 201


@app.route("/api/events/<int:event_id>", methods=["PUT"])
def update_event(event_id):

    data = request.get_json()

    event = get_event(event_id)

    if not event:
        return jsonify({
            "error": "Event not found"
        }), 404

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    conn = get_db()

    conn.execute("""
        UPDATE events
        SET name = ?,
            type = ?,
            date = ?,
            time = ?,
            budget = ?,
            participants = ?,
            venue = ?
        WHERE id = ?
    """, (
        data.get("name", event["name"]),
        data.get("type", event["type"]),
        data.get("date", event["date"]),
        data.get("time", event["time"]),
        float(data.get("budget", event["budget"])),
        int(data.get("participants", event["participants"])),
        data.get("venue", event["venue"]),
        event_id
    ))

    conn.commit()

    updated = conn.execute(
        "SELECT * FROM events WHERE id = ?",
        (event_id,)
    ).fetchone()

    conn.close()

    return jsonify({
        "message": "Event updated successfully",
        "event": row_to_dict(updated)
    }), 200


@app.route("/api/events/<int:event_id>", methods=["DELETE"])
def delete_event(event_id):

    event = get_event(event_id)

    if not event:
        return jsonify({
            "error": "Event not found"
        }), 404

    conn = get_db()

    conn.execute(
        "DELETE FROM events WHERE id = ?",
        (event_id,)
    )

    conn.execute(
        "DELETE FROM attendees WHERE event_id = ?",
        (event_id,)
    )

    conn.execute(
        "DELETE FROM expenses WHERE event_id = ?",
        (event_id,)
    )

    conn.execute(
        "DELETE FROM sponsors WHERE event_id = ?",
        (event_id,)
    )

    conn.execute(
        "DELETE FROM approvals WHERE event_id = ?",
        (event_id,)
    )

    conn.execute(
        "DELETE FROM notifications WHERE event_id = ?",
        (event_id,)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Event deleted successfully"
    }), 200


# =========================================================
# ATTENDEE API
# =========================================================

@app.route("/api/attendees", methods=["GET"])
def get_attendees():

    conn = get_db()

    attendees = conn.execute("""
        SELECT
            attendees.*,
            events.name AS event_name
        FROM attendees
        LEFT JOIN events
        ON attendees.event_id = events.id
        ORDER BY attendees.id DESC
    """).fetchall()

    conn.close()

    return jsonify([
        row_to_dict(attendee)
        for attendee in attendees
    ]), 200


@app.route("/api/attendees", methods=["POST"])
def create_attendee():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    required_fields = [
        "event_id",
        "name"
    ]

    for field in required_fields:

        if field not in data:
            return jsonify({
                "error": f"{field} is required"
            }), 400

    event_id = data["event_id"]

    event = get_event(event_id)

    if not event:
        return jsonify({
            "error": "Event not found"
        }), 404

    conn = get_db()

    # Check participant limit
    current_count = conn.execute("""
        SELECT COUNT(*) AS count
        FROM attendees
        WHERE event_id = ?
    """, (event_id,)).fetchone()["count"]

    if (
        event["participants"] > 0
        and current_count >= event["participants"]
    ):
        conn.close()

        return jsonify({
            "error": "Participant limit reached"
        }), 400

    # Generate registration ID
    reg_id = data.get(
        "reg_id",
        "REG" + str(datetime.now().strftime("%H%M%S"))
    )

    ticket_id = data.get(
        "ticket_id",
        "TKT" + str(datetime.now().strftime("%H%M%S"))
    )

    registration_date = datetime.now().strftime(
        "%Y-%m-%d"
    )

    cursor = conn.execute("""
        INSERT INTO attendees
        (
            reg_id,
            event_id,
            name,
            email,
            phone,
            college,
            department,
            year,
            ticket_id,
            status,
            registration_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        reg_id,
        event_id,
        data["name"],
        data.get("email", ""),
        data.get("phone", ""),
        data.get("college", ""),
        data.get("department", ""),
        data.get("year", ""),
        ticket_id,
        data.get("status", "Registered"),
        registration_date
    ))

    conn.commit()

    attendee_id = cursor.lastrowid

    attendee = conn.execute(
        "SELECT * FROM attendees WHERE id = ?",
        (attendee_id,)
    ).fetchone()

    conn.close()

    # Automatic registration notification
    create_notification(
        event_id,
        "Registration",
        f"New participant registered: {data['name']}"
    )

    return jsonify({
        "message": "Attendee registered successfully",
        "attendee": row_to_dict(attendee)
    }), 201


@app.route("/api/attendees/<int:attendee_id>", methods=["PUT"])
def update_attendee(attendee_id):

    data = request.get_json()

    conn = get_db()

    attendee = conn.execute(
        "SELECT * FROM attendees WHERE id = ?",
        (attendee_id,)
    ).fetchone()

    if not attendee:
        conn.close()

        return jsonify({
            "error": "Attendee not found"
        }), 404

    if not data:
        conn.close()

        return jsonify({
            "error": "Request body is required"
        }), 400

    status = data.get(
        "status",
        attendee["status"]
    )

    conn.execute("""
        UPDATE attendees
        SET name = ?,
            email = ?,
            phone = ?,
            college = ?,
            department = ?,
            year = ?,
            status = ?
        WHERE id = ?
    """, (
        data.get("name", attendee["name"]),
        data.get("email", attendee["email"]),
        data.get("phone", attendee["phone"]),
        data.get("college", attendee["college"]),
        data.get("department", attendee["department"]),
        data.get("year", attendee["year"]),
        status,
        attendee_id
    ))

    conn.commit()

    updated = conn.execute(
        "SELECT * FROM attendees WHERE id = ?",
        (attendee_id,)
    ).fetchone()

    conn.close()

    return jsonify({
        "message": "Attendee updated successfully",
        "attendee": row_to_dict(updated)
    }), 200


# =========================================================
# RESOURCE API
# =========================================================

@app.route("/api/resources", methods=["GET"])
def get_resources():

    conn = get_db()

    resources = conn.execute(
        "SELECT * FROM resources ORDER BY id DESC"
    ).fetchall()

    conn.close()

    return jsonify([
        row_to_dict(resource)
        for resource in resources
    ]), 200


@app.route("/api/resources", methods=["POST"])
def create_resource():

    data = request.get_json()

    if not data or not data.get("name"):
        return jsonify({
            "error": "Resource name is required"
        }), 400

    quantity = int(data.get("quantity", 0))

    if quantity < 0:
        return jsonify({
            "error": "Quantity cannot be negative"
        }), 400

    conn = get_db()

    existing = conn.execute("""
        SELECT *
        FROM resources
        WHERE LOWER(name) = LOWER(?)
    """, (data["name"],)).fetchone()

    if existing:

        new_quantity = existing["quantity"] + quantity

        conn.execute("""
            UPDATE resources
            SET quantity = ?
            WHERE id = ?
        """, (
            new_quantity,
            existing["id"]
        ))

        resource_id = existing["id"]

    else:

        cursor = conn.execute("""
            INSERT INTO resources
            (name, quantity)
            VALUES (?, ?)
        """, (
            data["name"],
            quantity
        ))

        resource_id = cursor.lastrowid

    conn.commit()

    resource = conn.execute(
        "SELECT * FROM resources WHERE id = ?",
        (resource_id,)
    ).fetchone()

    conn.close()

    return jsonify({
        "message": "Resource added successfully",
        "resource": row_to_dict(resource)
    }), 201


# =========================================================
# VENDOR API
# =========================================================

@app.route("/api/vendors", methods=["GET"])
def get_vendors():

    conn = get_db()

    vendors = conn.execute(
        "SELECT * FROM vendors ORDER BY id DESC"
    ).fetchall()

    conn.close()

    return jsonify([
        row_to_dict(vendor)
        for vendor in vendors
    ]), 200


@app.route("/api/vendors", methods=["POST"])
def create_vendor():

    data = request.get_json()

    if not data or not data.get("name"):
        return jsonify({
            "error": "Vendor name is required"
        }), 400

    conn = get_db()

    # Prevent duplicate email
    email = data.get("email", "")

    if email:

        existing = conn.execute("""
            SELECT id
            FROM vendors
            WHERE LOWER(email) = LOWER(?)
        """, (email,)).fetchone()

        if existing:
            conn.close()

            return jsonify({
                "error": "Vendor email already exists"
            }), 400

    cursor = conn.execute("""
        INSERT INTO vendors
        (name, service, phone, email, rating)
        VALUES (?, ?, ?, ?, ?)
    """, (
        data["name"],
        data.get("service", ""),
        data.get("phone", ""),
        email,
        float(data.get("rating", 0))
    ))

    conn.commit()

    vendor_id = cursor.lastrowid

    vendor = conn.execute(
        "SELECT * FROM vendors WHERE id = ?",
        (vendor_id,)
    ).fetchone()

    conn.close()

    return jsonify({
        "message": "Vendor added successfully",
        "vendor": row_to_dict(vendor)
    }), 201


# =========================================================
# BUDGET API
# =========================================================

@app.route("/api/budget/<int:event_id>", methods=["GET"])
def get_budget(event_id):

    event = get_event(event_id)

    if not event:
        return jsonify({
            "error": "Event not found"
        }), 404

    conn = get_db()

    total_expenses = conn.execute("""
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM expenses
        WHERE event_id = ?
    """, (event_id,)).fetchone()["total"]

    sponsorship = conn.execute("""
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM sponsors
        WHERE event_id = ?
    """, (event_id,)).fetchone()["total"]

    conn.close()

    budget = float(event["budget"] or 0)
    expenses = float(total_expenses or 0)
    sponsorship = float(sponsorship or 0)

    remaining = budget - expenses

    if budget > 0:
        utilization = (expenses / budget) * 100
    else:
        utilization = 0

    financial_balance = remaining + sponsorship

    return jsonify({
        "event_id": event_id,
        "event_name": event["name"],
        "budget": budget,
        "expenses": expenses,
        "remaining": remaining,
        "sponsorship": sponsorship,
        "financial_balance": financial_balance,
        "utilization": round(utilization, 2)
    }), 200


# =========================================================
# EXPENSE API
# =========================================================

@app.route("/api/expenses", methods=["GET"])
def get_expenses():

    event_id = request.args.get("event_id")

    conn = get_db()

    if event_id:

        expenses = conn.execute("""
            SELECT
                expenses.*,
                events.name AS event_name
            FROM expenses
            LEFT JOIN events
            ON expenses.event_id = events.id
            WHERE expenses.event_id = ?
            ORDER BY expenses.id DESC
        """, (event_id,)).fetchall()

    else:

        expenses = conn.execute("""
            SELECT
                expenses.*,
                events.name AS event_name
            FROM expenses
            LEFT JOIN events
            ON expenses.event_id = events.id
            ORDER BY expenses.id DESC
        """).fetchall()

    conn.close()

    return jsonify([
        row_to_dict(expense)
        for expense in expenses
    ]), 200


@app.route("/api/expenses", methods=["POST"])
def create_expense():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    event_id = data.get("event_id")
    category = data.get("category")
    amount = data.get("amount")

    if not event_id:
        return jsonify({
            "error": "Event is required"
        }), 400

    if not category:
        return jsonify({
            "error": "Expense category is required"
        }), 400

    try:
        amount = float(amount)
    except:
        return jsonify({
            "error": "Invalid expense amount"
        }), 400

    if amount <= 0:
        return jsonify({
            "error": "Expense amount must be greater than zero"
        }), 400

    event = get_event(event_id)

    if not event:
        return jsonify({
            "error": "Event not found"
        }), 404

    conn = get_db()

    current_expenses = conn.execute("""
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM expenses
        WHERE event_id = ?
    """, (event_id,)).fetchone()["total"]

    current_expenses = float(current_expenses or 0)

    event_budget = float(event["budget"] or 0)

    # Prevent budget overflow
    if event_budget > 0:

        if current_expenses + amount > event_budget:

            conn.close()

            return jsonify({
                "error": "Expense exceeds the event budget",
                "budget": event_budget,
                "current_expenses": current_expenses,
                "remaining": event_budget - current_expenses
            }), 400

    cursor = conn.execute("""
        INSERT INTO expenses
        (
            event_id,
            category,
            description,
            amount,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        event_id,
        category,
        data.get("description", ""),
        amount,
        datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    ))

    conn.commit()

    expense_id = cursor.lastrowid

    expense = conn.execute(
        "SELECT * FROM expenses WHERE id = ?",
        (expense_id,)
    ).fetchone()

    conn.close()

    return jsonify({
        "message": "Expense added successfully",
        "expense": row_to_dict(expense)
    }), 201


@app.route("/api/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):

    conn = get_db()

    expense = conn.execute(
        "SELECT * FROM expenses WHERE id = ?",
        (expense_id,)
    ).fetchone()

    if not expense:

        conn.close()

        return jsonify({
            "error": "Expense not found"
        }), 404

    conn.execute(
        "DELETE FROM expenses WHERE id = ?",
        (expense_id,)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Expense deleted successfully"
    }), 200


# =========================================================
# SPONSORSHIP API
# =========================================================

@app.route("/api/sponsors", methods=["GET"])
def get_sponsors():

    conn = get_db()

    sponsors = conn.execute("""
        SELECT
            sponsors.*,
            events.name AS event_name
        FROM sponsors
        LEFT JOIN events
        ON sponsors.event_id = events.id
        ORDER BY sponsors.id DESC
    """).fetchall()

    conn.close()

    return jsonify([
        row_to_dict(sponsor)
        for sponsor in sponsors
    ]), 200


@app.route("/api/sponsors", methods=["POST"])
def create_sponsor():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    event_id = data.get("event_id")
    name = data.get("name")

    if not event_id:
        return jsonify({
            "error": "Event is required"
        }), 400

    if not name:
        return jsonify({
            "error": "Sponsor name is required"
        }), 400

    try:
        amount = float(data.get("amount", 0))
    except:
        return jsonify({
            "error": "Invalid sponsorship amount"
        }), 400

    if amount < 0:
        return jsonify({
            "error": "Sponsorship amount cannot be negative"
        }), 400

    event = get_event(event_id)

    if not event:
        return jsonify({
            "error": "Event not found"
        }), 404

    conn = get_db()

    cursor = conn.execute("""
        INSERT INTO sponsors
        (
            event_id,
            name,
            amount,
            contact,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        event_id,
        name,
        amount,
        data.get("contact", ""),
        datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    ))

    conn.commit()

    sponsor_id = cursor.lastrowid

    sponsor = conn.execute(
        "SELECT * FROM sponsors WHERE id = ?",
        (sponsor_id,)
    ).fetchone()

    conn.close()

    return jsonify({
        "message": "Sponsor added successfully",
        "sponsor": row_to_dict(sponsor)
    }), 201


# =========================================================
# APPROVAL WORKFLOW API
# =========================================================

@app.route("/api/approvals", methods=["GET"])
def get_approvals():

    conn = get_db()

    approvals = conn.execute("""
        SELECT
            approvals.*,
            events.name AS event_name
        FROM approvals
        LEFT JOIN events
        ON approvals.event_id = events.id
        ORDER BY approvals.id DESC
    """).fetchall()

    conn.close()

    return jsonify([
        row_to_dict(approval)
        for approval in approvals
    ]), 200


@app.route("/api/approvals", methods=["POST"])
def create_approval():

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    event_id = data.get("event_id")
    item = data.get("item")

    if not event_id:
        return jsonify({
            "error": "Event is required"
        }), 400

    if not item:
        return jsonify({
            "error": "Approval item is required"
        }), 400

    event = get_event(event_id)

    if not event:
        return jsonify({
            "error": "Event not found"
        }), 404

    status = data.get(
        "status",
        "Pending"
    )

    if status not in [
        "Pending",
        "Approved",
        "Rejected"
    ]:
        return jsonify({
            "error": "Invalid approval status"
        }), 400

    conn = get_db()

    cursor = conn.execute("""
        INSERT INTO approvals
        (
            event_id,
            item,
            requested_by,
            status,
            created_at
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        event_id,
        item,
        data.get("requested_by", ""),
        status,
        datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )
    ))

    conn.commit()

    approval_id = cursor.lastrowid

    approval = conn.execute(
        "SELECT * FROM approvals WHERE id = ?",
        (approval_id,)
    ).fetchone()

    conn.close()

    create_notification(
        event_id,
        "Approval",
        f"Approval request created: {item}"
    )

    return jsonify({
        "message": "Approval request created successfully",
        "approval": row_to_dict(approval)
    }), 201


@app.route("/api/approvals/<int:approval_id>", methods=["PUT"])
def update_approval(approval_id):

    data = request.get_json()

    if not data or "status" not in data:
        return jsonify({
            "error": "Status is required"
        }), 400

    status = data["status"]

    if status not in [
        "Pending",
        "Approved",
        "Rejected"
    ]:
        return jsonify({
            "error": "Invalid approval status"
        }), 400

    conn = get_db()

    approval = conn.execute(
        "SELECT * FROM approvals WHERE id = ?",
        (approval_id,)
    ).fetchone()

    if not approval:

        conn.close()

        return jsonify({
            "error": "Approval request not found"
        }), 404

    conn.execute("""
        UPDATE approvals
        SET status = ?
        WHERE id = ?
    """, (
        status,
        approval_id
    ))

    conn.commit()

    updated = conn.execute(
        "SELECT * FROM approvals WHERE id = ?",
        (approval_id,)
    ).fetchone()

    conn.close()

    create_notification(
        approval["event_id"],
        "Approval",
        f"Approval '{approval['item']}' is now {status}"
    )

    return jsonify({
        "message": "Approval status updated",
        "approval": row_to_dict(updated)
    }), 200


# =========================================================
# NOTIFICATION API
# =========================================================

@app.route("/api/notifications", methods=["GET"])
def get_notifications():

    conn = get_db()

    notifications = conn.execute("""
        SELECT
            notifications.*,
            events.name AS event_name
        FROM notifications
        LEFT JOIN events
        ON notifications.event_id = events.id
        ORDER BY notifications.id DESC
    """).fetchall()

    conn.close()

    return jsonify([
        row_to_dict(notification)
        for notification in notifications
    ]), 200


@app.route("/api/notifications", methods=["POST"])
def create_manual_notification():

    data = request.get_json()

    if not data or not data.get("message"):
        return jsonify({
            "error": "Notification message is required"
        }), 400

    event_id = data.get("event_id")

    if event_id:

        event = get_event(event_id)

        if not event:
            return jsonify({
                "error": "Event not found"
            }), 404

    create_notification(
        event_id,
        data.get("type", "General"),
        data["message"]
    )

    return jsonify({
        "message": "Notification created successfully"
    }), 201


# =========================================================
# AUTOMATIC REMINDER API
# =========================================================

@app.route("/api/reminders", methods=["GET"])
def generate_reminders():

    conn = get_db()

    events = conn.execute(
        "SELECT * FROM events"
    ).fetchall()

    reminders_created = []

    today = datetime.now().date()
    tomorrow = today + timedelta(days=1)

    for event in events:

        event_date = event["date"]

        if not event_date:
            continue

        try:

            parsed_date = datetime.strptime(
                event_date,
                "%Y-%m-%d"
            ).date()

        except ValueError:
            continue

        if parsed_date == tomorrow:

            message = (
                f"Reminder: {event['name']} "
                f"is scheduled for tomorrow."
            )

            # Prevent duplicate reminder
            existing = conn.execute("""
                SELECT id
                FROM notifications
                WHERE event_id = ?
                AND type = 'Reminder'
                AND message = ?
            """, (
                event["id"],
                message
            )).fetchone()

            if not existing:

                conn.execute("""
                    INSERT INTO notifications
                    (
                        event_id,
                        type,
                        message,
                        status,
                        created_at
                    )
                    VALUES (?, ?, ?, ?, ?)
                """, (
                    event["id"],
                    "Reminder",
                    message,
                    "Unread",
                    datetime.now().strftime(
                        "%Y-%m-%d %H:%M:%S"
                    )
                ))

                reminders_created.append({
                    "event_id": event["id"],
                    "event_name": event["name"],
                    "message": message
                })

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Reminder automation completed",
        "reminders_created": reminders_created
    }), 200


# =========================================================
# DASHBOARD API
# =========================================================

@app.route("/api/dashboard", methods=["GET"])
def dashboard():

    conn = get_db()

    total_events = conn.execute("""
        SELECT COUNT(*) AS count
        FROM events
    """).fetchone()["count"]

    total_attendees = conn.execute("""
        SELECT COUNT(*) AS count
        FROM attendees
    """).fetchone()["count"]

    total_expenses = conn.execute("""
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM expenses
    """).fetchone()["total"]

    total_sponsorship = conn.execute("""
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM sponsors
    """).fetchone()["total"]

    pending_approvals = conn.execute("""
        SELECT COUNT(*) AS count
        FROM approvals
        WHERE status = 'Pending'
    """).fetchone()["count"]

    total_vendors = conn.execute("""
        SELECT COUNT(*) AS count
        FROM vendors
    """).fetchone()["count"]

    total_resources = conn.execute("""
        SELECT COUNT(*) AS count
        FROM resources
    """).fetchone()["count"]

    total_notifications = conn.execute("""
        SELECT COUNT(*) AS count
        FROM notifications
    """).fetchone()["count"]

    checked_in = conn.execute("""
        SELECT COUNT(*) AS count
        FROM attendees
        WHERE status = 'Checked In'
    """).fetchone()["count"]

    conn.close()

    return jsonify({

        "total_events": total_events,

        "total_attendees": total_attendees,

        "total_expenses": float(
            total_expenses or 0
        ),

        "total_sponsorship": float(
            total_sponsorship or 0
        ),

        "pending_approvals": pending_approvals,

        "total_vendors": total_vendors,

        "total_resources": total_resources,

        "total_notifications": total_notifications,

        "checked_in": checked_in

    }), 200


# =========================================================
# ERROR HANDLERS
# =========================================================

@app.errorhandler(404)
def not_found(error):

    return jsonify({
        "error": "API endpoint not found"
    }), 404


@app.errorhandler(500)
def server_error(error):

    return jsonify({
        "error": "Internal server error"
    }), 500


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":

    print("")
    print("==============================================")
    print("        EventSphere REST API Server")
    print("==============================================")
    print("")
    print("Server running at:")
    print("http://127.0.0.1:5000")
    print("")
    print("API Base URL:")
    print("http://127.0.0.1:5000/api")
    print("")
    print("Health Check:")
    print("http://127.0.0.1:5000/api/health")
    print("")
    print("==============================================")
    print("")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )