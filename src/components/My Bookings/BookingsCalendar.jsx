// import React, { useState, useEffect, useCallback } from "react";

// // import { format, parse, startOfWeek, getDay } from "date-fns";

// // import enUS from "date-fns/locale/en-US";
// import axios from "../../api/axios";
// import { GET_ALL_BOOKINGS } from "../../api/apiUrls";

// // const locales = {
// //     "en-US": enUS,
// // };

// const localizer = dateFnsLocalizer({
//     format,
//     parse,
//     startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
//     getDay,
//     locales,
// });

// // Sample bookings/events
// // const bookings = [
// //     {
// //         id: 1,
// //         title: "Booking A",
// //         start: new Date(2025, 6, 31, 10, 0),
// //         end: new Date(2025, 6, 31, 12, 0),
// //     },
// //     {
// //         id: 2,
// //         title: "Booking B",
// //         start: new Date(2025, 7, 2, 14, 0),
// //         end: new Date(2025, 7, 2, 15, 0),
// //     },
// //     {
// //         id: 3,
// //         title: "Booking C",
// //         start: new Date(2025, 7, 3, 9, 0),
// //         end: new Date(2025, 7, 3, 10, 30),
// //     },
// // ];


// function BookingsCalendar() {
//     const [view, setView] = useState(Views.MONTH);
//     const [date, setDate] = useState(new Date());
//     const [bookings, setBookings] = useState([]);

//     const handleNavigate = (action) => {
//         const newDate = Calendar.Navigate[action](date, view);
//         setDate(newDate);
//     };

//     useEffect(() => {
//         const getAllBookings = async () => {
//             const response = await axios.get(GET_ALL_BOOKINGS);
//             // console.log("getAllBookings: ", response.data);
//             const events = response.data.results.map((item) => ({
//                 id: item.booking_id,
//                 title: `Booking #${item.booking_id} - ${item.booking_status}`,
//                 start: new Date(item.actual_start_date_time),
//                 end: new Date(item.actual_end_date_time),
//             }));
//             setBookings(events)
//         }

//         getAllBookings();
//     }, [])


//     // Handle slot selection to create a new event
//     const handleSelectSlot = ({ start, end }) => {
//         const title = prompt("Enter a title for your booking:");
//         if (title) {
//             const newBooking = {
//                 id: bookings.length + 1,
//                 title,
//                 start,
//                 end,
//             };
//             console.log("new booking goes here...", newBooking);
//             setBookings([...bookings, newBooking]);
//         }
//     };

//     const handleSelectEvent = useCallback(
//         (event) => window.alert(event.title),
//         []
//     )

//     return (
//         <>
//             <h2>Bookings Calendar View</h2>
//             <hr />
//             <div style={{ height: "100vh", padding: 20 }}>
//                 <Calendar
//                     localizer={localizer}
//                     events={bookings}
//                     startAccessor="start"
//                     endAccessor="end"
//                     defaultView={view}
//                     view={view}
//                     onView={setView}
//                     date={date}
//                     onNavigate={setDate}
//                     selectable={true}
//                     onSelectSlot={handleSelectSlot}
//                     onSelectEvent={handleSelectEvent}
//                     style={{ height: "85vh" }}
//                 />
//             </div>
//         </>
//     )
// }

// export default BookingsCalendar
import React from "react";

const name = () => {
    <div>
        <h1>hi</h1>
    </div>
}
export default name;