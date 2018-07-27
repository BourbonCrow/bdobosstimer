// https://fullcalendar.io/docs
// http://ui.toast.com/tui-calendar
// -- https://nhnent.github.io/tui.calendar/latest/index.html
function isDST(t) { 
    var jan = new Date(t.getFullYear(), 0, 1);
    var jul = new Date(t.getFullYear(), 6, 1);
    return Math.min(jan.getTimezoneOffset(), jul.getTimezoneOffset()) == t.getTimezoneOffset();
  }
// Globals --------------------------------------------------------------------
var calendar = null;
var events = [];
var current_time = moment();
var image_path = 'static/images/';
var next_boss = [];
d = new Date();
d.setMinutes(d.getMinutes() + d.getTimezoneOffset()); // UTC
if (isDST(d)) {
 var utc_offset = 2; // UTC+2 (Daylight Saving)
} else {
 var utc_offset = 1; // UTC+1
}
var location_base_url = 'http://www.somethinglovely.net';
var database_base_url = 'https://bddatabase.net'; // 'https://bdocodex.com'

// msToTime -------------------------------------------------------------------
function msToTime(duration) {
    var seconds = parseInt((duration / 1000) % 60);
    var minutes = parseInt((duration / (1000 * 60)) % 60);
    var hours = parseInt((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    //return hours + ":" + minutes + ":" + seconds;
    return hours + "h " + minutes + "m " + seconds + "s";
}

// checkTime ------------------------------------------------------------------
function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

// addEvents ------------------------------------------------------------------
function addEvents() {
    // Loop through raw events
    for (var i = 0; i < raw_events.length; i++) {
        // Init
        var color = boss_mapping[raw_events[i]['type']]['color'];
        var display_short = boss_mapping[raw_events[i]['type']]['display']['short'];
        // Previous week
        start = moment().utcOffset(utc_offset).startOf('week').subtract(7, 'days').add(raw_events[i]['start']);
        event = {
            'title': display_short,
            'start': start,
            'color': color,
        };
        events.push(event);
        // Current week
        start = moment().utcOffset(utc_offset).startOf('week').add(raw_events[i]['start']);
        event = {
            'title': display_short,
            'start': start,
            'color': color,
        };
        events.push(event);
        // Next week
        var start = moment().utcOffset(utc_offset).startOf('week').add(7, 'days').add(raw_events[i]['start']);
        event = {
            'title': display_short,
            'start': start,
            'color': color,
        };
        events.push(event);
    }
}

// setCalendar ----------------------------------------------------------------
function setCalendar() {
    calendar = $('#eu-full-calendar-instance').fullCalendar({
        header: {
            left: '',
            center: '',
            right: ''
        },
        slotLabelFormat: [
            'HH:mm' // top level of text
          ],
        allDaySlot: false,
        contentHeight: 549,
        events: events,
        defaultView: 'agendaWeek',
        timeFormat: 'HH:mm',
        nowIndicator: true,
        dayClick: function (date) {
            console.log('dayClick', date.format());
        },
        timezone: 'local', // 'America/Los Angeles','Europe/Amsterdam'
        ignoreTimezone: false,
        firstDay: 1,
        navLinks: false, // can click day/week names to navigate views
        editable: false,
        selectable: false,
        slotDuration: '01:00:00',
        // slotDuration: '00:30:00',
        defaultTimedEventDuration: '01:00:00',
        // defaultTimedEventDuration: '00:30:00',
        eventLimit: true, // allow "more" link when too many events
        // eventRender: function (event, el) {
        //     // render the timezone offset below the event title
        //     if (event.start.hasZone()) {
        //         el.find('.fc-title').after(
        //             $('<div class="tzo"/>').text(event.start.format('Z'))
        //         );
        //     }
        // },
        // columnHeaderHtml: function (mom) {
        //     if (mom.weekday() === 5) {
        //         return '<b>Friday!</b>';
        //     } else {
        //         return '<i>' + mom.format('LLL') + '</i>';
        //     }
        // }
        columnHeaderText: function (mom) {
            return mom.format('ddd');
        }
    });
}

// checkNextBoss --------------------------------------------------------------
function checkNextBoss() {
    for (var i = 0; i < raw_events.length; i++) {
        var start = moment().utcOffset(utc_offset).startOf('week').add(raw_events[i]['start']);
        // var color = boss_mapping[raw_events[i]['type']]['color'];
        var display_full = boss_mapping[raw_events[i]['type']]['display']['full'];
        var image = image_path + boss_mapping[raw_events[i]['type']]['image'];
        if ((next_boss.length === 0 && start > current_time) || (next_boss.length > 0 && start.isSame(next_boss[0].time))) {
            next_boss_entry = {
                name: display_full,
                time: start,
                image: image,
                type: raw_events[i]['type']
            };
            next_boss.push(next_boss_entry);
        }
    }

    console.log(next_boss);
    document.getElementById('eu-1-next-boss-content-time').innerHTML = next_boss[0].time.local().format('dddd, Do MMMM YYYY @ HH:mm');
    document.getElementById("eu-1-next-boss-content-image").src = next_boss[0].image;
    document.getElementById('eu-1-next-boss-content-name').innerHTML = next_boss[0].name;
    document.getElementById('eu-1-next-boss-content-meta-location-link').setAttribute("href", location_base_url + boss_mapping[next_boss[0]['type']]['meta']['location']);
    document.getElementById('eu-1-next-boss-content-meta-guide-link').setAttribute("href", boss_mapping[next_boss[0]['type']]['meta']['guide']);
    document.getElementById('eu-1-next-boss-content-meta-database-link').setAttribute("href", database_base_url + boss_mapping[next_boss[0]['type']]['meta']['database']);
}

// startTime ------------------------------------------------------------------
function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    // add a zero in front of numbers < 10
    m = checkTime(m);
    s = checkTime(s);

    var current_time = moment();
    document.getElementById('current-time').innerHTML = current_time.format('HH:mm:ss');

    var next_boss_eta = msToTime(next_boss[0].time.diff(current_time));
    document.getElementById('eu-1-next-boss-content-eta').innerHTML = next_boss_eta;

    t = setTimeout(function () {
        startTime()
    }, 500);
}

// Entry point ----------------------------------------------------------------
$(document).ready(function () {
    $('.dropdown').dropdown();
    addEvents();
    setCalendar();
    checkNextBoss();
    startTime();
});