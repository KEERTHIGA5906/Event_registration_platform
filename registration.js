let events =
    JSON.parse(localStorage.getItem("events")) || [];

let attendees =
    JSON.parse(localStorage.getItem("attendees")) || [];

let tickets =
    JSON.parse(localStorage.getItem("tickets")) || [];


const $=id=>document.getElementById(id);


function save(){

    localStorage.setItem(
        "attendees",
        JSON.stringify(attendees)
    );

    localStorage.setItem(
        "tickets",
        JSON.stringify(tickets)
    );
}


function loadEvents(){

    $("eventId").innerHTML=
        '<option value="">Select an Event</option>';

    events.forEach(e=>{

        $("eventId").innerHTML+=`

            <option value="${e.id}">
                ${e.name} - ${e.date}
            </option>

        `;

    });
}


function generateTicketId(){

    let number=1001;

    if(tickets.length){

        number=1001+tickets.length;

    }

    let id="TKT"+number;

    while(tickets.some(t=>t.ticketId==id)){

        number++;

        id="TKT"+number;

    }

    return id;
}


$("registrationForm").onsubmit=e=>{

    e.preventDefault();


    let eventId=$("eventId").value;

    let name=$("studentName").value.trim();

    let email=$("email").value.trim();

    let phone=$("phone").value.trim();

    let college=$("college").value.trim();

    let department=$("department").value.trim();

    let year=$("year").value;


    if(!eventId){

        return showMessage(
            "Please select an event.",
            "error"
        );

    }


    if(!/^[0-9]{10}$/.test(phone)){

        return showMessage(
            "Phone number must contain 10 digits.",
            "error"
        );

    }


    let duplicate=attendees.some(a=>

        a.eventId==eventId &&
        (
            a.email.toLowerCase()==
            email.toLowerCase()
            ||
            a.phone==phone
        )

    );


    if(duplicate){

        return showMessage(
            "You are already registered for this event.",
            "error"
        );

    }


    let event=events.find(
        e=>e.id==eventId
    );


    if(!event){

        return showMessage(
            "Event not found.",
            "error"
        );

    }


    let count=attendees.filter(
        a=>a.eventId==eventId
    ).length;


    if(count>=Number(event.participants)){

        return showMessage(
            "Registration limit for this event is full.",
            "error"
        );

    }


    let regId=
        "REG"+
        String(attendees.length+1)
        .padStart(4,"0");


    let ticketId=generateTicketId();


    let attendee={

        regId:regId,

        eventId:Number(eventId),

        name:name,

        email:email,

        phone:phone,

        college:college,

        department:department,

        year:year,

        ticketId:ticketId,

        status:"Registered",

        date:new Date().toLocaleDateString()

    };


    attendees.push(attendee);


    tickets.push({

        ticketId:ticketId,

        registrationId:regId,

        eventId:Number(eventId),

        participant:name,

        issueDate:new Date().toLocaleDateString()

    });


    save();


    localStorage.setItem(
        "lastTicket",
        JSON.stringify(attendee)
    );


    window.location.href="ticket.html";

};


function showMessage(text,type){

    $("registrationMessage").innerHTML=`

        <div class="${type}">
            ${text}
        </div>

    `;

}


loadEvents();