let attendee=
    JSON.parse(
        localStorage.getItem("lastTicket")
    );


let events=
    JSON.parse(
        localStorage.getItem("events")
    )||[];


if(!attendee){

    document.body.innerHTML=`

        <div class="ticket-container">

            <div class="section">

                <h2>
                    No Ticket Found
                </h2>

                <p>
                    Please complete registration first.
                </p>

                <button
                    onclick="location.href='registration.html'">

                    Register Now

                </button>

            </div>

        </div>

    `;

}else{

    let event=events.find(
        e=>e.id==attendee.eventId
    );


    document.getElementById(
        "ticketName"
    ).textContent=attendee.name;


    document.getElementById(
        "ticketReg"
    ).textContent=attendee.regId;


    document.getElementById(
        "ticketId"
    ).textContent=attendee.ticketId;


    document.getElementById(
        "ticketEvent"
    ).textContent=
        event?event.name:"Event";


    document.getElementById(
        "ticketDate"
    ).textContent=
        event?event.date:"";


    document.getElementById(
        "ticketTime"
    ).textContent=
        event?event.time:"";


    document.getElementById(
        "ticketVenue"
    ).textContent=
        event?event.venue:"Not Assigned";


    new QRCode(
        document.getElementById("qrcode"),
        {
            text:
                attendee.ticketId+
                "|" +
                attendee.regId+
                "|" +
                attendee.eventId,

            width:150,

            height:150
        }
    );

}