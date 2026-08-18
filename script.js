let events=
    JSON.parse(localStorage.getItem("events"))||[];

let venues=
    JSON.parse(localStorage.getItem("venues"))||[];

let resources=
    JSON.parse(localStorage.getItem("resources"))||[];

let attendees=
    JSON.parse(localStorage.getItem("attendees"))||[];

let tickets=
    JSON.parse(localStorage.getItem("tickets"))||[];

let vendors=
    JSON.parse(localStorage.getItem("vendors"))||[];

let assignments=
    JSON.parse(localStorage.getItem("assignments"))||[];


const $=id=>document.getElementById(id);


function save(){

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


function msg(text,type){

    $("message").textContent=text;

    $("message").className=type;
}


function updateCounts(){

    $("eventCount").textContent=
        events.length;

    $("venueCount").textContent=
        venues.length;

    $("resourceCount").textContent=
        resources.length;

    $("registrationCount").textContent=
        attendees.length;

    $("vendorCount").textContent=
        vendors.length;
}


/* EVENTS */

function eventOptions(){

    let ids=[
        "eventSelect",
        "resourceEvent",
        "vendorEvent"
    ];

    ids.forEach(id=>{

        if(!$(id)) return;

        $(id).innerHTML=
            '<option value="">Select Event</option>';

        events.forEach(e=>{

            $(id).innerHTML+=`

                <option value="${e.id}">
                    ${e.name}
                </option>

            `;

        });

    });


    if($("registrationEventFilter")){

        $("registrationEventFilter").innerHTML=
            '<option value="">All Events</option>';

        events.forEach(e=>{

            $("registrationEventFilter").innerHTML+=`

                <option value="${e.id}">
                    ${e.name}
                </option>

            `;

        });

    }
}


function showEvents(){

    if(!events.length){

        $("eventList").innerHTML=
            "No Events Created Yet.";

        eventOptions();

        return;
    }


    $("eventList").innerHTML=

        events.map(e=>`

            <div class="item">

                <h3>${e.name}</h3>

                <p>
                    Type:
                    ${e.type}
                </p>

                <p>
                    Date:
                    ${e.date}
                    |
                    Time:
                    ${e.time}
                </p>

                <p>
                    Budget:
                     ${e.budget}
                </p>

                <p>
                    Maximum Participants:
                    ${e.participants}
                </p>

                <p>
                    Venue:
                    ${e.venue}
                </p>

            </div>

        `).join("");


    eventOptions();
}


$("eventForm").onsubmit=e=>{

    e.preventDefault();


    let event={

        id:events.length?
            Math.max(...events.map(x=>x.id))+1:
            1,

        name:$("eventName").value.trim(),

        type:$("eventType").value.trim(),

        date:$("eventDate").value,

        time:$("eventTime").value,

        budget:Number(
            $("eventBudget").value
        ),

        participants:Number(
            $("eventParticipants").value
        ),

        venue:"Not Assigned",

        resources:[]

    };


    events.push(event);

    save();

    updateCounts();

    showEvents();

    e.target.reset();

    msg(
        "Event Created Successfully!",
        "success"
    );

};


/* VENUES */

function venueOptions(){

    $("venueSelect").innerHTML=
        '<option value="">Select Venue</option>';

    venues.forEach(v=>{

        $("venueSelect").innerHTML+=`

            <option value="${v.id}">
                ${v.name}
            </option>

        `;

    });
}


function showVenues(){

    if(!venues.length){

        $("venueList").innerHTML=
            "No Venues Added Yet.";

        return;
    }


    $("venueList").innerHTML=

        venues.map(v=>`

            <div class="item">

                <h3>${v.name}</h3>

                <p>
                    Location:
                    ${v.location}
                </p>

                <p>
                    Capacity:
                    ${v.capacity}
                </p>

                <p>
                    Available:
                    ${v.available?"Yes":"No"}
                </p>

            </div>

        `).join("");


    venueOptions();
}


$("venueForm").onsubmit=e=>{

    e.preventDefault();


    venues.push({

        id:venues.length?
            Math.max(...venues.map(x=>x.id))+1:
            1,

        name:$("venueName").value.trim(),

        location:$("venueLocation").value.trim(),

        capacity:Number(
            $("venueCapacity").value
        ),

        available:true

    });


    save();

    updateCounts();

    showVenues();

    e.target.reset();

    msg(
        "Venue Added Successfully!",
        "success"
    );

};


/* VENUE ASSIGNMENT */

$("assignForm").onsubmit=e=>{

    e.preventDefault();


    let event=events.find(
        x=>x.id==$("eventSelect").value
    );


    let venue=venues.find(
        x=>x.id==$("venueSelect").value
    );


    if(!event||!venue){

        return msg(
            "Select Event and Venue.",
            "error"
        );

    }


    if(venue.capacity<event.participants){

        return msg(
            "Venue Capacity is Insufficient.",
            "error"
        );

    }


    let conflict=events.some(x=>

        x.id!=event.id &&

        x.venue==venue.name &&

        x.date==event.date &&

        x.time==event.time

    );


    if(conflict){

        return msg(
            "Scheduling Conflict!",
            "error"
        );

    }


    event.venue=venue.name;

    venue.available=false;


    save();

    showEvents();

    showVenues();

    msg(
        "Venue Assigned Successfully!",
        "success"
    );

};


/* RESOURCES */

function resourceOptions(){

    $("resourceSelect").innerHTML=
        '<option value="">Select Resource</option>';

    resources.forEach(r=>{

        $("resourceSelect").innerHTML+=`

            <option value="${r.id}">
                ${r.name}
            </option>

        `;

    });
}


function showResources(){

    if(!resources.length){

        $("resourceList").innerHTML=
            "No Resources Added Yet.";

        return;
    }


    $("resourceList").innerHTML=

        resources.map(r=>`

            <div class="item">

                <h3>${r.name}</h3>

                <p>
                    Available Quantity:
                    ${r.quantity}
                </p>

            </div>

        `).join("");


    resourceOptions();
}


$("resourceForm").onsubmit=e=>{

    e.preventDefault();


    let name=
        $("resourceName").value.trim();

    let quantity=
        Number($("resourceQuantity").value);


    let resource=
        resources.find(
            r=>r.name.toLowerCase()==
            name.toLowerCase()
        );


    if(resource){

        resource.quantity+=quantity;

    }else{

        resources.push({

            id:resources.length?
                Math.max(...resources.map(x=>x.id))+1:
                1,

            name:name,

            quantity:quantity

        });

    }


    save();

    updateCounts();

    showResources();

    e.target.reset();

    msg(
        "Resource Added Successfully!",
        "success"
    );

};


/* RESOURCE ALLOCATION */

$("allocateForm").onsubmit=e=>{

    e.preventDefault();


    let event=events.find(
        x=>x.id==$("resourceEvent").value
    );


    let resource=resources.find(
        x=>x.id==$("resourceSelect").value
    );


    let quantity=
        Number($("requiredQuantity").value);


    if(!event||!resource){

        return msg(
            "Select Event and Resource.",
            "error"
        );

    }


    if(quantity>resource.quantity){

        return msg(
            "Not Enough Resources.",
            "error"
        );

    }


    resource.quantity-=quantity;


    event.resources.push({

        name:resource.name,

        quantity:quantity

    });


    save();

    showResources();

    msg(
        "Resource Allocated Successfully!",
        "success"
    );

    e.target.reset();

};


/* REGISTRATIONS */

function showRegistrations(){

    let filter=
        $("registrationEventFilter").value;


    let list=attendees.filter(a=>

        !filter ||
        a.eventId==filter

    );


    if(!list.length){

        $("registrationList").innerHTML=
            "No Registrations Yet.";

        return;
    }


    $("registrationList").innerHTML=

        list.map(a=>{

            let event=events.find(
                e=>e.id==a.eventId
            );


            return `

                <div class="item">

                    <h3>${a.name}</h3>

                    <p>
                        Event:
                        ${event?event.name:"Unknown"}
                    </p>

                    <p>
                        Registration ID:
                        ${a.regId}
                    </p>

                    <p>
                        Email:
                        ${a.email}
                    </p>

                    <p>
                        Phone:
                        ${a.phone}
                    </p>

                    <p>
                        College:
                        ${a.college}
                    </p>

                    <p>
                        Department:
                        ${a.department}
                    </p>

                    <p>
                        Ticket:
                        <b>${a.ticketId}</b>
                    </p>

                    <p>
                        Attendance:
                        <b>${a.status}</b>
                    </p>

                </div>

            `;

        }).join("");

}


/* ATTENDANCE */

$("attendanceForm").onsubmit=e=>{

    e.preventDefault();


    let ticket=
        $("attendanceTicket")
        .value
        .trim();


    let attendee=attendees.find(

        a=>
        a.ticketId.toLowerCase()==
        ticket.toLowerCase()

    );


    if(!attendee){

        $("attendanceMessage").innerHTML=`

            <div class="error">
                Invalid Ticket ID.
            </div>

        `;

        return;
    }


    if(attendee.status=="Checked In"){

        $("attendanceMessage").innerHTML=`

            <div class="error">
                Participant is already checked in.
            </div>

        `;

        return;
    }


    attendee.status="Checked In";


    save();

    showRegistrations();


    $("attendanceMessage").innerHTML=`

        <div class="success">

            Attendance Updated Successfully!

            <br>

            ${attendee.name}
            is Checked In.

        </div>

    `;


    $("attendanceTicket").value="";

};


/* VENDORS */

function vendorOptions(){

    $("vendorSelect").innerHTML=
        '<option value="">Select Vendor</option>';


    vendors.forEach(v=>{

        $("vendorSelect").innerHTML+=`

            <option value="${v.id}">
                ${v.name} - ${v.service}
            </option>

        `;

    });

}


function showVendors(){

    if(!vendors.length){

        $("vendorList").innerHTML=
            "No Vendors Added Yet.";

        return;
    }


    $("vendorList").innerHTML=

        vendors.map(v=>`

            <div class="item">

                <h3>${v.name}</h3>

                <p>
                    Vendor ID:
                    V${v.id}
                </p>

                <p>
                    Service:
                    ${v.service}
                </p>

                <p>
                    Phone:
                    ${v.phone}
                </p>

                <p>
                    Email:
                    ${v.email}
                </p>

                <p>
                    Rating:
                    ${v.rating?
                    v.rating+" / 5":
                    "Not Rated"}
                </p>

            </div>

        `).join("");


    vendorOptions();

}


$("vendorForm").onsubmit=e=>{

    e.preventDefault();


    let phone=
        $("vendorPhone").value.trim();


    if(!/^[0-9]{10}$/.test(phone)){

        return msg(
            "Vendor phone must contain 10 digits.",
            "error"
        );

    }


    let duplicate=vendors.some(v=>

        v.email.toLowerCase()==
        $("vendorEmail")
        .value
        .trim()
        .toLowerCase()

    );


    if(duplicate){

        return msg(
            "Vendor already exists.",
            "error"
        );

    }


    vendors.push({

        id:vendors.length?
            Math.max(...vendors.map(x=>x.id))+1:
            1,

        name:$("vendorName").value.trim(),

        service:$("vendorService").value.trim(),

        phone:phone,

        email:$("vendorEmail").value.trim(),

        rating:0

    });


    save();

    updateCounts();

    showVendors();

    e.target.reset();


    msg(
        "Vendor Added Successfully!",
        "success"
    );

};


/* VENDOR ASSIGNMENT */

$("vendorAssignmentForm").onsubmit=e=>{

    e.preventDefault();


    let event=events.find(
        x=>x.id==$("vendorEvent").value
    );


    let vendor=vendors.find(
        x=>x.id==$("vendorSelect").value
    );


    let service=
        $("vendorAssignmentService")
        .value
        .trim();


    if(!event||!vendor){

        return msg(
            "Please select Event and Vendor.",
            "error"
        );

    }


    let exists=assignments.some(a=>

        a.eventId==event.id &&
        a.vendorId==vendor.id

    );


    if(exists){

        return msg(
            "Vendor is already assigned to this event.",
            "error"
        );

    }


    assignments.push({

        id:assignments.length?
            Math.max(...assignments.map(x=>x.id))+1:
            1,

        eventId:event.id,

        vendorId:vendor.id,

        service:service,

        status:"Assigned"

    });


    save();

    showAssignments();

    e.target.reset();


    msg(
        "Vendor Assigned Successfully!",
        "success"
    );

};


function showAssignments(){

    if(!assignments.length){

        $("assignmentList").innerHTML=
            "No Vendor Assignments Yet.";

        return;
    }


    $("assignmentList").innerHTML=

        assignments.map(a=>{

            let event=events.find(
                e=>e.id==a.eventId
            );


            let vendor=vendors.find(
                v=>v.id==a.vendorId
            );


            return `

                <div class="item">

                    <h3>
                        ${event?
                        event.name:
                        "Unknown Event"}
                    </h3>

                    <p>
                        Vendor:
                        ${vendor?
                        vendor.name:
                        "Unknown"}
                    </p>

                    <p>
                        Service:
                        ${a.service}
                    </p>

                    <p>
                        Status:
                        <b>${a.status}</b>
                    </p>

                </div>

            `;

        }).join("");

}


/* REPORT */

function report(){

    let checked=
        attendees.filter(
            a=>a.status=="Checked In"
        ).length;


    $("report").innerHTML=`

        <div class="item">

            <h3>EventSphere Report</h3>

            <p>
                Total Events:
                <b>${events.length}</b>
            </p>

            <p>
                Total Registrations:
                <b>${attendees.length}</b>
            </p>

            <p>
                Checked In:
                <b>${checked}</b>
            </p>

            <p>
                Total Vendors:
                <b>${vendors.length}</b>
            </p>

            <p>
                Vendor Assignments:
                <b>${assignments.length}</b>
            </p>

            <hr>

            ${events.map(e=>{

                let registered=
                    attendees.filter(
                        a=>a.eventId==e.id
                    );


                let present=
                    registered.filter(
                        a=>a.status=="Checked In"
                    );


                let assigned=
                    assignments.filter(
                        a=>a.eventId==e.id
                    );


                return `

                    <div>

                        <h3>${e.name}</h3>

                        <p>
                            Date:
                            ${e.date}
                        </p>

                        <p>
                            Venue:
                            ${e.venue}
                        </p>

                        <p>
                            Registered:
                            ${registered.length}
                        </p>

                        <p>
                            Checked In:
                            ${present.length}
                        </p>

                        <p>
                            Vendors:
                            ${assigned.length}
                        </p>

                    </div>

                    <hr>

                `;

            }).join("")}

        </div>

    `;

}


/* INITIALIZE */

eventOptions();

venueOptions();

resourceOptions();

showEvents();

showVenues();

showResources();

showRegistrations();

showVendors();

showAssignments();

updateCounts();
