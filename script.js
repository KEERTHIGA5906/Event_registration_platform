
let events=[],venues=[],resources=[];

const $=id=>document.getElementById(id);
const msg=(t,c)=>{$("message").textContent=t;$("message").className=c};

function eventOptions(){
    ["eventSelect","resourceEvent"].forEach(id=>{
        $(id).innerHTML='<option value="">Select Event</option>';
        events.forEach(e=>$(id).innerHTML+=`<option value="${e.id}">${e.name}</option>`);
    });
}

function venueOptions(){
    $("venueSelect").innerHTML='<option value="">Select Venue</option>';
    venues.forEach(v=>$("venueSelect").innerHTML+=`<option value="${v.id}">${v.name}</option>`);
}

function resourceOptions(){
    $("resourceSelect").innerHTML='<option value="">Select Resource</option>';
    resources.forEach(r=>$("resourceSelect").innerHTML+=`<option value="${r.id}">${r.name}</option>`);
}

function showEvents(){
    $("eventList").innerHTML=events.length?events.map(e=>`
        <div class="item">
        <h3>${e.name}</h3>
        <p>Type: ${e.type}</p>
        <p>Date: ${e.date} | Time: ${e.time}</p>
        <p>Budget: ${e.budget}</p>
        <p>Participants: ${e.participants}</p>
        <p>Venue: ${e.venue}</p>
        </div>`).join(""):"No Events Created Yet.";
    eventOptions();
}

function showVenues(){
    $("venueList").innerHTML=venues.length?venues.map(v=>`
        <div class="item">
        <h3>${v.name}</h3>
        <p>Location: ${v.location}</p>
        <p>Capacity: ${v.capacity}</p>
        <p>Available: ${v.available?"Yes":"No"}</p>
        </div>`).join(""):"No Venues Added Yet.";
    venueOptions();
}

function showResources(){
    $("resourceList").innerHTML=resources.length?resources.map(r=>`
        <div class="item">
        <h3>${r.name}</h3>
        <p>Available Quantity: ${r.quantity}</p>
        </div>`).join(""):"No Resources Added Yet.";
    resourceOptions();
}

$("eventForm").onsubmit=e=>{
    e.preventDefault();

    events.push({
        id:events.length+1,
        name:$("eventName").value,
        type:$("eventType").value,
        date:$("eventDate").value,
        time:$("eventTime").value,
        budget:$("eventBudget").value,
        participants:$("eventParticipants").value,
        venue:"Not Assigned",
        resources:[]
    });

    $("eventCount").textContent=events.length;
    showEvents();
    e.target.reset();
};

$("venueForm").onsubmit=e=>{
    e.preventDefault();

    venues.push({
        id:venues.length+1,
        name:$("venueName").value,
        location:$("venueLocation").value,
        capacity:+$("venueCapacity").value,
        available:true
    });

    $("venueCount").textContent=venues.length;
    showVenues();
    e.target.reset();
};

$("assignForm").onsubmit=e=>{
    e.preventDefault();

    let event=events.find(x=>x.id==$("eventSelect").value);
    let venue=venues.find(x=>x.id==$("venueSelect").value);

    if(venue.capacity<event.participants)
        return msg("Venue Capacity is Insufficient.","error");

    if(events.some(x=>x.id!=event.id &&
        x.venue==venue.name &&
        x.date==event.date &&
        x.time==event.time))
        return msg("Scheduling Conflict!","error");

    event.venue=venue.name;
    venue.available=false;

    showEvents();
    showVenues();
    msg("Venue Assigned Successfully!","success");
};

$("resourceForm").onsubmit=e=>{
    e.preventDefault();

    let name=$("resourceName").value;
    let q=+$("resourceQuantity").value;
    let r=resources.find(x=>x.name.toLowerCase()==name.toLowerCase());

    r?r.quantity+=q:resources.push({
        id:resources.length+1,name,quantity:q
    });

    $("resourceCount").textContent=resources.length;
    showResources();
    e.target.reset();
};

$("allocateForm").onsubmit=e=>{
    e.preventDefault();

    let event=events.find(x=>x.id==$("resourceEvent").value);
    let resource=resources.find(x=>x.id==$("resourceSelect").value);
    let q=+$("requiredQuantity").value;

    if(q>resource.quantity)
        return msg("Not Enough Resources.","error");

    resource.quantity-=q;
    event.resources.push({name:resource.name,quantity:q});

    showResources();
    msg("Resource Allocated Successfully!","success");
    e.target.reset();
};

function report(){
    $("report").innerHTML=`
        <div class="item">
        <h3>Total Events: ${events.length}</h3>
        <p>Total Venues: ${venues.length}</p>
        <p>Total Resources: ${resources.length}</p>
        ${events.map(e=>`
            <hr>
            <p><b>${e.name}</b></p>
            <p>Date: ${e.date} | Time: ${e.time}</p>
            <p>Venue: ${e.venue}</p>
            <p>Participants: ${e.participants}</p>
            <p>Budget: ${e.budget}</p>
        `).join("")}
        </div>`;
}

