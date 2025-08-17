

// import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, RefreshCw, Search, Download, CheckCircle, XCircle, AlertCircle, Info, Activity, TrendingUp, BarChart3, Zap, Shield, Sun, Moon, Loader, Trash2 } from 'lucide-react';

// const MachineBookingSystem = () => {
//   // Core States
//   const [viewDays, setViewDays] = useState(7);
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [bookingModal, setBookingModal] = useState(false);
//   const [cancelModal, setCancelModal] = useState(false);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [bookings, setBookings] = useState({});
//   const [machines, setMachines] = useState([]);
//   const [submitting, setSubmitting] = useState(false);
//   const [showStats, setShowStats] = useState(true);
//   const [autoRefresh, setAutoRefresh] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const refreshInterval = useRef(null);
  
//   // Stats
//   const [stats, setStats] = useState({
//     totalBookings: 0,
//     activeBookings: 0,
//     cancelledBookings: 0,
//     changeOfDateBookings: 0,
//     blockedBookings: 0,
//     totalMachines: 0,
//     availableMachines: 0,
//     utilizationRate: 0
//   });

//   const [bookingForm, setBookingForm] = useState({ 
//     machineid: '',
//     plannedstartdatetime: '',
//     plannedenddatetime: '',
//     notes: ''
//   });

//   const [cancelForm, setCancelForm] = useState({
//     reason: ''
//   });

//   // Generate mock data for testing
//   const generateMockData = useCallback(() => {
//     console.log('Generating mock data for testing...');
//     // Using actual machine IDs from API response instead of mock ones
//     const apiMachineIds = [5019, 5032, 5048, 5112, 5119, 5124, 5127, 5131, 5138, 5139, 5145, 5147, 5149, 5152, 5155];
//     const mockBookings = {};
    
//     apiMachineIds.forEach((machineId, index) => {
//       const machineKey = `Machine_${machineId}`;
//       mockBookings[machineKey] = [];
      
//       // Add some random bookings for demonstration
//       if (index % 4 === 0) { // Add booking to every 4th machine
//         const startDate = new Date();
//         startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 10));
//         const endDate = new Date(startDate);
//         endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1);
        
//         // Mix of blocked (manual) and accepted (backend) bookings
//         const isManualBooking = Math.random() > 0.5;
        
//         mockBookings[machineKey].push({
//           id: 100 + index,
//           start: startDate,
//           end: endDate,
//           status: isManualBooking ? 'blocked' : 'accepted',
//           type: isManualBooking ? 'blocked' : 'booking',
//           description: `${isManualBooking ? 'Manual' : 'System'} Booking #${100 + index} for Machine ${machineId}`,
//           hirerCompany: 1025,
//           renterCompany: 1031,
//           quoteId: isManualBooking ? null : 2000 + index,
//           notes: isManualBooking ? 'Manually created booking' : 'System generated booking'
//         });
//       }
//     });
    
//     setMachines(apiMachineIds.map(id => `Machine_${id}`));
//     setBookings(mockBookings);
    
//     // Calculate stats
//     const allBookings = Object.values(mockBookings).flat();
//     const totalBookings = allBookings.length;
//     const activeBookings = allBookings.filter(b => b.status === 'accepted').length;
//     const blockedBookings = allBookings.filter(b => b.status === 'blocked').length;
    
//     setStats({
//       totalBookings,
//       activeBookings,
//       blockedBookings,
//       cancelledBookings: 0,
//       changeOfDateBookings: 0,
//       totalMachines: apiMachineIds.length,
//       availableMachines: apiMachineIds.length - totalBookings,
//       utilizationRate: Math.round((totalBookings / apiMachineIds.length) * 100)
//     });
    
//     setLoading(false);
//     console.log('Demo data loaded successfully with blocked/accepted bookings');
//   }, []);

//   // Fetch bookings from API
//   const fetchBookings = useCallback(async () => {
//     console.log('Fetching bookings from API...');
//     setLoading(true);
//     setError(null);
    
//     try {
//       // Simulate API call - replace with actual axios call
//       const response = await new Promise((resolve) => {
//         setTimeout(() => {
//           resolve({
//             data: {
//               results: [
//                 {
//                   booking_id: 282,
//                   machine_id: 5148,
//                   actual_start_date_time: "2025-08-14T07:01:00.000Z",
//                   actual_end_date_time: "2025-08-16T05:01:00.000Z",
//                   booking_status: "accepted",
//                   hirer_company_id: 1025,
//                   renter_company_id: 1040,
//                   quote_id: 2464,
//                   cancelled_reason: "",
//                   rescheduled_reason: ""
//                 },
//                 // Add more sample data with blocked status
//                 {
//                   booking_id: 283,
//                   machine_id: 5019,
//                   actual_start_date_time: "2025-08-15T08:00:00.000Z",
//                   actual_end_date_time: "2025-08-17T17:00:00.000Z",
//                   booking_status: "blocked",
//                   hirer_company_id: null,
//                   renter_company_id: null,
//                   quote_id: null,
//                   cancelled_reason: "",
//                   rescheduled_reason: ""
//                 }
//               ]
//             }
//           });
//         }, 1000);
//       });
      
//       console.log('API Response:', response);
      
//       if (response && response.data && response.data.results && Array.isArray(response.data.results)) {
//         const processedBookings = {};
//         const uniqueMachines = new Set();
//         let totalBookingsCount = 0;
//         let activeBookingsCount = 0;
//         let blockedBookingsCount = 0;
//         let cancelledBookingsCount = 0;
//         let changeOfDateCount = 0;
        
//         response.data.results.forEach(booking => {
//           const machineKey = `Machine_${booking.machine_id}`;
//           uniqueMachines.add(machineKey);
          
//           if (!processedBookings[machineKey]) {
//             processedBookings[machineKey] = [];
//           }
          
//           const startDate = new Date(booking.actual_start_date_time);
//           const endDate = new Date(booking.actual_end_date_time);
          
//           const bookingData = {
//             id: booking.booking_id,
//             start: startDate,
//             end: endDate,
//             status: booking.booking_status,
//             type: booking.booking_status,
//             description: `Booking #${booking.booking_id}${booking.quote_id ? ` - Quote #${booking.quote_id}` : ''}`,
//             hirerCompany: booking.hirer_company_id,
//             renterCompany: booking.renter_company_id,
//             cancelledReason: booking.cancelled_reason || '',
//             rescheduledReason: booking.rescheduled_reason || '',
//             quoteId: booking.quote_id,
//             notes: booking.booking_status === 'blocked' ? 'Manually blocked slot' : 'System booking'
//           };
          
//           processedBookings[machineKey].push(bookingData);
//           totalBookingsCount++;
          
//           if (booking.booking_status === 'accepted') {
//             activeBookingsCount++;
//           } else if (booking.booking_status === 'blocked') {
//             blockedBookingsCount++;
//           } else if (booking.booking_status === 'cancelled') {
//             cancelledBookingsCount++;
//           } else if (booking.booking_status === 'change_of_date') {
//             changeOfDateCount++;
//           }
//         });
        
//         setBookings(processedBookings);
//         const sortedMachines = Array.from(uniqueMachines).sort((a, b) => {
//           const numA = parseInt(a.replace('Machine_', ''));
//           const numB = parseInt(b.replace('Machine_', ''));
//           return numA - numB;
//         });
//         setMachines(sortedMachines);
        
//         const totalMachinesCount = uniqueMachines.size;
//         const utilizationRate = totalMachinesCount > 0 ? 
//           Math.round(((activeBookingsCount + blockedBookingsCount) / totalMachinesCount) * 100) : 0;
        
//         setStats({
//           totalBookings: totalBookingsCount,
//           activeBookings: activeBookingsCount,
//           blockedBookings: blockedBookingsCount,
//           cancelledBookings: cancelledBookingsCount,
//           changeOfDateBookings: changeOfDateCount,
//           totalMachines: totalMachinesCount,
//           availableMachines: totalMachinesCount - activeBookingsCount - blockedBookingsCount,
//           utilizationRate
//         });

//         console.log(`Loaded ${totalBookingsCount} bookings for ${totalMachinesCount} machines`);
//       } else {
//         console.warn('No valid data received from API, using mock data');
//         generateMockData();
//       }
//     } catch (err) {
//       console.error('API Error:', err);
//       setError('API connection failed. Using demo data.');
//       generateMockData();
//     } finally {
//       setLoading(false);
//     }
//   }, [generateMockData]);

//   // Auto-refresh
//   useEffect(() => {
//     if (autoRefresh) {
//       refreshInterval.current = setInterval(fetchBookings, 60000);
//       return () => {
//         if (refreshInterval.current) {
//           clearInterval(refreshInterval.current);
//         }
//       };
//     }
//   }, [autoRefresh, fetchBookings]);

//   // Initial fetch
//   useEffect(() => {
//     fetchBookings();
//   }, [fetchBookings]);

//   // Filtered machines
//   const filteredMachines = useMemo(() => {
//     if (!searchQuery) return machines;
    
//     return machines.filter(machine => {
//       const machineNumber = machine.replace('Machine_', '');
//       return machineNumber.includes(searchQuery) || 
//              machine.toLowerCase().includes(searchQuery.toLowerCase());
//     });
//   }, [machines, searchQuery]);

//   // Get dates for current view
//   const getDates = () => {
//     const dates = [];
//     for (let i = 0; i < viewDays; i++) {
//       const date = new Date(currentDate);
//       date.setDate(currentDate.getDate() + i);
//       dates.push(date);
//     }
//     return dates;
//   };

//   const formatDateTime = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day} 06:00:00`;
//   };

//   // Navigation
//   const navigate = (direction) => {
//     const newDate = new Date(currentDate);
//     const multiplier = direction.includes('Fast') ? viewDays : Math.ceil(viewDays / 2);
    
//     if (direction.includes('prev')) {
//       newDate.setDate(currentDate.getDate() - multiplier);
//     } else {
//       newDate.setDate(currentDate.getDate() + multiplier);
//     }
    
//     setCurrentDate(newDate);
//   };

//   const goToToday = () => {
//     setCurrentDate(new Date());
//   };

//   // Get cell status for a specific machine and date
//   const getCellStatus = (machine, date) => {
//     const machineBookings = bookings[machine] || [];
//     for (const booking of machineBookings) {
//       const cellDate = new Date(date);
//       cellDate.setHours(0, 0, 0, 0);
//       const startDate = new Date(booking.start);
//       startDate.setHours(0, 0, 0, 0);
//       const endDate = new Date(booking.end);
//       endDate.setHours(0, 0, 0, 0);
      
//       if (cellDate >= startDate && cellDate <= endDate) {
//         return {
//           ...booking,
//           isStart: cellDate.getTime() === startDate.getTime(),
//           isEnd: cellDate.getTime() === endDate.getTime()
//         };
//       }
//     }
//     return null;
//   };

//   // Handle cell click
//   const handleCellClick = (machine, date) => {
//     const existingBooking = getCellStatus(machine, date);
//     if (!existingBooking) {
//       // Create new booking
//       const machineId = machine.replace('Machine_', '');
//       setSelectedSlot({ machine, machineId, date });
      
//       const startDate = new Date(date);
//       const endDate = new Date(date);
//       endDate.setDate(endDate.getDate() + 1);
      
//       setBookingForm({
//         machineid: parseInt(machineId),
//         plannedstartdatetime: formatDateTime(startDate),
//         plannedenddatetime: formatDateTime(endDate),
//         notes: ''
//       });
      
//       setBookingModal(true);
//     } else {
//       // Show cancel modal for existing booking
//       setSelectedBooking(existingBooking);
//       setCancelForm({ reason: '' });
//       setCancelModal(true);
//     }
//   };

//   // Submit booking
//   const handleBookingSubmit = async () => {
//     if (!bookingForm.machineid || !bookingForm.plannedstartdatetime || !bookingForm.plannedenddatetime) {
//       console.log('Please fill in all required fields');
//       return;
//     }

//     const startDate = new Date(bookingForm.plannedstartdatetime);
//     const endDate = new Date(bookingForm.plannedenddatetime);
    
//     if (endDate <= startDate) {
//       console.log('End date must be after start date');
//       return;
//     }

//     setSubmitting(true);
//     try {
//       console.log('Creating booking with payload:', {
//         ...bookingForm,
//         booking_status: 'blocked' // Manual bookings are blocked
//       });
      
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       await fetchBookings();
//       setBookingModal(false);
//       setSelectedSlot(null);
//       setBookingForm({
//         machineid: '',
//         plannedstartdatetime: '',
//         plannedenddatetime: '',
//         notes: ''
//       });
      
//       console.log('Booking created successfully!');
      
//     } catch (err) {
//       console.error('Error creating booking:', err);
//       console.log(`Failed to create booking: ${err.message}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Cancel booking
//   const handleBookingCancel = async () => {
//     if (!cancelForm.reason.trim()) {
//       console.log('Please provide a reason for cancellation');
//       return;
//     }

//     setSubmitting(true);
//     try {
//       console.log('Cancelling booking:', selectedBooking.id, 'Reason:', cancelForm.reason);
      
//       // Simulate API call
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       await fetchBookings();
//       setCancelModal(false);
//       setSelectedBooking(null);
//       setCancelForm({ reason: '' });
      
//       console.log('Booking cancelled successfully!');
      
//     } catch (err) {
//       console.error('Error cancelling booking:', err);
//       console.log(`Failed to cancel booking: ${err.message}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Export data
//   const exportData = () => {
//     const csvHeader = "Machine ID,Booking ID,Start Date,End Date,Status,Hirer Company,Renter Company,Quote ID,Notes\n";
//     const csvContent = Object.entries(bookings).flatMap(([machine, machineBookings]) =>
//       machineBookings.map(booking => 
//         `${machine.replace('Machine_', '')},${booking.id},${booking.start.toISOString()},${booking.end.toISOString()},${booking.status},${booking.hirerCompany || ''},${booking.renterCompany || ''},${booking.quoteId || ''},"${booking.notes || ''}"`
//       )
//     ).join("\n");
    
//     const fullCsvContent = "data:text/csv;charset=utf-8," + csvHeader + csvContent;
//     const encodedUri = encodeURI(fullCsvContent);
//     const link = document.createElement("a");
//     link.setAttribute("href", encodedUri);
//     link.setAttribute("download", `machine_bookings_${new Date().toISOString().split('T')[0]}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
    
//     console.log('Booking data exported to CSV');
//   };

//   const dates = getDates();
//   const isToday = (date) => {
//     const today = new Date();
//     return date.toDateString() === today.toDateString();
//   };

//   const isWeekend = (date) => {
//     const day = date.getDay();
//     return day === 0 || day === 6;
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'accepted': return '#3B82F6'; // Blue for backend/system bookings
//       case 'blocked': return '#10B981';  // Green for manual bookings
//       case 'cancelled': return '#EF4444';
//       case 'change_of_date': return '#F59E0B';
//       default: return '#6B7280';
//     }
//   };

//   return (
//     <div style={{ width: '100%', height: '100%' }}>
//       {/* Header */}
//       <div style={{ 
//         backgroundColor: 'white', 
//         borderRadius: '6px', 
//         boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', 
//         marginBottom: '16px' 
//       }}>
//         <div style={{ 
//           backgroundColor: '#2563eb', 
//           color: 'white', 
//           padding: '16px', 
//           borderTopLeftRadius: '6px',
//           borderTopRightRadius: '6px'
//         }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <div>
//               <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Machine Booking Calendar</h1>
//               <p style={{ color: 'rgba(219, 234, 254, 1)', fontSize: '14px', margin: '4px 0 0 0' }}>Resource Management & Scheduling</p>
//             </div>
//             <div style={{ display: 'flex', gap: '8px' }}>
//               <button
//                 onClick={() => setShowStats(!showStats)}
//                 style={{ 
//                   padding: '8px', 
//                   backgroundColor: 'rgba(255, 255, 255, 0.2)', 
//                   border: 'none',
//                   borderRadius: '4px',
//                   color: 'white',
//                   cursor: 'pointer',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}
//                 title="Toggle stats"
//               >
//                 <BarChart3 size={16} />
//               </button>
//               <button
//                 onClick={exportData}
//                 style={{ 
//                   padding: '8px', 
//                   backgroundColor: 'rgba(255, 255, 255, 0.2)', 
//                   border: 'none',
//                   borderRadius: '4px',
//                   color: 'white',
//                   cursor: 'pointer',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center'
//                 }}
//                 title="Export CSV"
//               >
//                 <Download size={16} />
//               </button>
//               <button
//                 onClick={fetchBookings}
//                 style={{ 
//                   padding: '8px 12px', 
//                   backgroundColor: 'rgba(255, 255, 255, 0.2)', 
//                   border: 'none',
//                   borderRadius: '4px',
//                   color: 'white',
//                   cursor: 'pointer',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   fontSize: '14px',
//                   fontWeight: '500'
//                 }}
//                 title="Refresh data"
//                 disabled={loading}
//               >
//                 {loading ? 'Loading...' : 'Refresh'}
//               </button>
//               <button
//                 onClick={() => setAutoRefresh(!autoRefresh)}
//                 style={{ 
//                   padding: '8px', 
//                   backgroundColor: 'rgba(255, 255, 255, 0.2)', 
//                   border: 'none',
//                   borderRadius: '4px',
//                   color: 'white',
//                   cursor: 'pointer',
//                   display: 'flex',
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   outline: autoRefresh ? '2px solid rgba(255, 255, 255, 0.5)' : 'none'
//                 }}
//                 title="Auto refresh"
//               >
//                 <Activity size={16} />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Stats Dashboard */}
//         {showStats && (
//           <div style={{ 
//             display: 'grid', 
//             gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
//             gap: '8px', 
//             padding: '12px',
//             backgroundColor: '#f9fafb'
//           }}>
//             <div style={{ textAlign: 'center', padding: '8px', borderRadius: '6px', backgroundColor: '#6366f1', color: 'white' }}>
//               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
//                 <Activity size={16} />
//               </div>
//               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.totalBookings}</div>
//               <div style={{ fontSize: '12px' }}>Total</div>
//             </div>
//             <div style={{ textAlign: 'center', padding: '8px', borderRadius: '6px', backgroundColor: '#3B82F6', color: 'white' }}>
//               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
//                 <CheckCircle size={16} />
//               </div>
//               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.activeBookings}</div>
//               <div style={{ fontSize: '12px' }}>System</div>
//             </div>
//             <div style={{ textAlign: 'center', padding: '8px', borderRadius: '6px', backgroundColor: '#10b981', color: 'white' }}>
//               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
//                 <Shield size={16} />
//               </div>
//               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.blockedBookings}</div>
//               <div style={{ fontSize: '12px' }}>Manual</div>
//             </div>
//             <div style={{ textAlign: 'center', padding: '8px', borderRadius: '6px', backgroundColor: '#ef4444', color: 'white' }}>
//               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
//                 <XCircle size={16} />
//               </div>
//               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.cancelledBookings}</div>
//               <div style={{ fontSize: '12px' }}>Cancelled</div>
//             </div>
//             <div style={{ textAlign: 'center', padding: '8px', borderRadius: '6px', backgroundColor: '#f59e0b', color: 'white' }}>
//               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.changeOfDateBookings}</div>
//               <div style={{ fontSize: '12px' }}>Rescheduled</div>
//             </div>
//             <div style={{ textAlign: 'center', padding: '8px', borderRadius: '6px', backgroundColor: '#14b8a6', color: 'white' }}>
//               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
//                 <Zap size={16} />
//               </div>
//               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.availableMachines}</div>
//               <div style={{ fontSize: '12px' }}>Available</div>
//             </div>
//             <div style={{ textAlign: 'center', padding: '8px', borderRadius: '6px', backgroundColor: '#8b5cf6', color: 'white' }}>
//               <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
//                 <TrendingUp size={16} />
//               </div>
//               <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.utilizationRate}%</div>
//               <div style={{ fontSize: '12px' }}>Utilization</div>
//             </div>
//           </div>
//         )}

//         {/* Search and Controls */}
//         <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
//             <div style={{ position: 'relative' }}>
//               <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>
//                 <Search size={16} />
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search machines (e.g., 5121, 5152)..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 style={{
//                   width: '100%',
//                   paddingLeft: '36px',
//                   paddingRight: '16px',
//                   paddingTop: '8px',
//                   paddingBottom: '8px',
//                   fontSize: '14px',
//                   border: '1px solid #d1d5db',
//                   borderRadius: '6px',
//                   outline: 'none',
//                   backgroundColor: 'white',
//                   color: '#111827'
//                 }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* View Controls */}
//         <div style={{ 
//           padding: '12px', 
//           display: 'flex', 
//           flexWrap: 'wrap', 
//           justifyContent: 'space-between', 
//           alignItems: 'center', 
//           gap: '12px',
//           borderBottom: '1px solid #e5e7eb'
//         }}>
//           <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
//             {viewDays === 1 ? 'Today View' : `${viewDays} Days View`} ({filteredMachines.length} machines)
//           </div>      
//           <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
//               <button
//                 onClick={() => setViewDays(1)}
//                 style={{
//                   padding: '6px 16px',
//                   fontSize: '13px',
//                   border: 'none',
//                   borderRadius: '6px',
//                   cursor: 'pointer',
//                   fontWeight: '500',
//                   backgroundColor: viewDays === 1 ? '#2563eb' : 'transparent',
//                   color: viewDays === 1 ? 'white' : '#374151',
//                   transition: 'all 0.2s'
//                 }}
//               >
//                 Today
//               </button>
//               <button
//                 onClick={() => setViewDays(7)}
//                 style={{
//                   padding: '6px 16px',
//                   fontSize: '13px',
//                   border: 'none',
//                   borderRadius: '6px',
//                   cursor: 'pointer',
//                   fontWeight: '500',
//                   backgroundColor: viewDays === 7 ? '#2563eb' : 'transparent',
//                   color: viewDays === 7 ? 'white' : '#374151',
//                   transition: 'all 0.2s'
//                 }}
//               >
//                 7 Days
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div style={{ 
//             padding: '16px', 
//             backgroundColor: '#fef2f2', 
//             border: '1px solid #fecaca', 
//             color: '#b91c1c',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '12px'
//           }}>
//             <AlertCircle size={16} />
//             <span style={{ flex: '1' }}>{error}</span>
//             <button 
//               onClick={fetchBookings} 
//               style={{
//                 padding: '4px 12px',
//                 backgroundColor: '#dc2626',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 fontSize: '14px',
//                 cursor: 'pointer'
//               }}
//               disabled={loading}
//             >
//               {loading ? 'Retrying...' : 'Retry'}
//             </button>
//           </div>
//         )}

//         {/* Loading State */}
//         {loading && (
//           <div style={{ padding: '32px' }}>
//             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
//               <Loader size={20} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
//               <span style={{ color: '#6b7280' }}>Loading booking data...</span>
//             </div>
//           </div>
//         )}

//         {/* Calendar Grid */}
//         {!loading && (
//           <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
//             <div style={{ minWidth: '100%' }}>
//               {/* Navigation Header */}
//               <div style={{ 
//                 display: 'flex', 
//                 alignItems: 'center', 
//                 justifyContent: 'space-between', 
//                 marginBottom: '16px', 
//                 padding: '0 16px',
//                 backgroundColor: '#f8fafc',
//                 borderRadius: '8px',
//                 margin: '0 16px 16px 16px',
//                 paddingTop: '12px',
//                 paddingBottom: '12px'
//               }}>
//                 {/* Navigation Controls */}
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                   <button
//                     onClick={() => navigate('prevFast')}
//                     style={{
//                       padding: '8px 12px',
//                       border: '1px solid #d1d5db',
//                       borderRadius: '6px',
//                       cursor: 'pointer',
//                       backgroundColor: 'white',
//                       color: '#374151',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '4px',
//                       fontSize: '14px',
//                       fontWeight: '500',
//                       boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
//                       transition: 'all 0.2s'
//                     }}
//                     title={`Previous ${viewDays === 1 ? 'day' : `${viewDays} days`}`}
//                     onMouseEnter={(e) => {
//                       e.target.style.backgroundColor = '#f3f4f6';
//                       e.target.style.transform = 'translateY(-1px)';
//                       e.target.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.target.style.backgroundColor = 'white';
//                       e.target.style.transform = 'translateY(0)';
//                       e.target.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
//                     }}
//                   >
//                     <span style={{ fontSize: '16px', fontWeight: 'bold' }}>�</span>
//                     <span>{viewDays === 1 ? 'Prev Day' : 'Prev'}</span>
//                   </button>
//                   <button
//                     onClick={() => navigate('prev')}
//                     style={{
//                       padding: '8px 12px',
//                       border: '1px solid #d1d5db',
//                       borderRadius: '6px',
//                       cursor: 'pointer',
//                       backgroundColor: 'white',
//                       color: '#374151',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '4px',
//                       fontSize: '14px',
//                       fontWeight: '500',
//                       boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
//                       transition: 'all 0.2s'
//                     }}
//                     title="Previous"
//                     onMouseEnter={(e) => {
//                       e.target.style.backgroundColor = '#f3f4f6';
//                       e.target.style.transform = 'translateY(-1px)';
//                       e.target.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.target.style.backgroundColor = 'white';
//                       e.target.style.transform = 'translateY(0)';
//                       e.target.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
//                     }}
//                   >
//                     <span style={{ fontSize: '16px', fontWeight: 'bold' }}>9</span>
//                   </button>
//                 </div>
                
//                 {/* Current Period Display */}
//                 <div style={{ textAlign: 'center', flex: 1 }}>
//                   <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
//                     {viewDays === 1 
//                       ? currentDate.toLocaleDateString('en-US', { 
//                           weekday: 'long', 
//                           year: 'numeric', 
//                           month: 'long', 
//                           day: 'numeric' 
//                         })
//                       : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
//                     }
//                   </h2>
//                   {viewDays > 1 && (
//                     <p style={{ fontSize: '14px', color: '#6b7280', margin: '2px 0 0 0' }}>
//                       {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
//                       {(() => {
//                         const endDate = new Date(currentDate);
//                         endDate.setDate(currentDate.getDate() + viewDays - 1);
//                         return endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//                       })()}
//                     </p>
//                   )}
//                 </div>
                
//                 {/* Forward Navigation */}
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                   <button
//                     onClick={() => navigate('next')}
//                     style={{
//                       padding: '8px 12px',
//                       border: '1px solid #d1d5db',
//                       borderRadius: '6px',
//                       cursor: 'pointer',
//                       backgroundColor: 'white',
//                       color: '#374151',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '4px',
//                       fontSize: '14px',
//                       fontWeight: '500',
//                       boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
//                       transition: 'all 0.2s'
//                     }}
//                     title="Next"
//                     onMouseEnter={(e) => {
//                       e.target.style.backgroundColor = '#f3f4f6';
//                       e.target.style.transform = 'translateY(-1px)';
//                       e.target.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.target.style.backgroundColor = 'white';
//                       e.target.style.transform = 'translateY(0)';
//                       e.target.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
//                     }}
//                   >
//                     <span style={{ fontSize: '16px', fontWeight: 'bold' }}>:</span>
//                   </button>
//                   <button
//                     onClick={() => navigate('nextFast')}
//                     style={{
//                       padding: '8px 12px',
//                       border: '1px solid #d1d5db',
//                       borderRadius: '6px',
//                       cursor: 'pointer',
//                       backgroundColor: 'white',
//                       color: '#374151',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '4px',
//                       fontSize: '14px',
//                       fontWeight: '500',
//                       boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
//                       transition: 'all 0.2s'
//                     }}
//                     title={`Next ${viewDays === 1 ? 'day' : `${viewDays} days`}`}
//                     onMouseEnter={(e) => {
//                       e.target.style.backgroundColor = '#f3f4f6';
//                       e.target.style.transform = 'translateY(-1px)';
//                       e.target.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
//                     }}
//                     onMouseLeave={(e) => {
//                       e.target.style.backgroundColor = 'white';
//                       e.target.style.transform = 'translateY(0)';
//                       e.target.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
//                     }}
//                   >
//                     <span>{viewDays === 1 ? 'Next Day' : 'Next'}</span>
//                     <span style={{ fontSize: '16px', fontWeight: 'bold' }}>�</span>
//                   </button>
//                 </div>
//               </div>

//               {/* Table */}
//               <div style={{ 
//                 overflow: 'hidden', 
//                 borderRadius: '4px', 
//                 border: '1px solid #d1d5db', 
//                 margin: '0 16px' 
//               }}>
//                 <div style={{ overflowX: 'auto' }}>
//                   <table style={{ 
//                     width: '100%', 
//                     borderCollapse: 'collapse', 
//                     minWidth: '800px',
//                     fontSize: '14px'
//                   }}>
//                     <thead>
//                       <tr>
//                         <th style={{
//                           border: '1px solid #d1d5db',
//                           padding: '12px',
//                           textAlign: 'left',
//                           fontWeight: '500',
//                           width: '96px',
//                           position: 'sticky',
//                           left: 0,
//                           zIndex: 20,
//                           backgroundColor: '#f9fafb',
//                           color: '#374151'
//                         }}>
//                           Machine ID
//                         </th>
//                         {dates.map((date, idx) => (
//                           <th 
//                             key={idx} 
//                             style={{
//                               border: '1px solid #d1d5db',
//                               padding: '8px',
//                               textAlign: 'center',
//                               fontWeight: '500',
//                               minWidth: '70px',
//                               backgroundColor: isToday(date) 
//                                 ? '#2563eb' 
//                                 : isWeekend(date)
//                                   ? '#f3f4f6'
//                                   : '#f9fafb',
//                               color: isToday(date) 
//                                 ? 'white' 
//                                 : isWeekend(date)
//                                   ? '#6b7280'
//                                   : '#374151'
//                             }}
//                           >
//                             <div style={{ fontSize: '12px' }}>
//                               {date.toLocaleDateString('en-US', { weekday: 'short' })}
//                             </div>
//                             <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
//                               {date.getDate()}-{date.toLocaleString('en', { month: 'short' })}
//                             </div>
//                             {isToday(date) && (
//                               <div style={{ fontSize: '12px', opacity: '0.75' }}>Today</div>
//                             )}
//                           </th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredMachines.length === 0 ? (
//                         <tr>
//                           <td colSpan={dates.length + 1} style={{ 
//                             textAlign: 'center', 
//                             padding: '32px', 
//                             color: '#6b7280' 
//                           }}>
//                             {searchQuery ? 'No machines found matching your search' : 'No machines available'}
//                           </td>
//                         </tr>
//                       ) : (
//                         filteredMachines.map((machine) => (
//                           <tr key={machine} style={{ backgroundColor: 'transparent' }}>
//                             <td style={{
//                               border: '1px solid #d1d5db',
//                               padding: '12px',
//                               fontWeight: '500',
//                               fontSize: '14px',
//                               position: 'sticky',
//                               left: 0,
//                               zIndex: 10,
//                               backgroundColor: '#f9fafb',
//                               color: '#374151'
//                             }}>
//                               {machine.replace('Machine_', '')}
//                             </td>
//                             {dates.map((date, idx) => {
//                               const status = getCellStatus(machine, date);
//                               let cellStyle = {
//                                 border: '1px solid #d1d5db',
//                                 padding: '4px',
//                                 height: '40px',
//                                 position: 'relative',
//                                 cursor: 'pointer',
//                                 fontSize: '12px',
//                                 textAlign: 'center'
//                               };
//                               let cellContent = null;
                              
//                               if (status) {
//                                 cellStyle.backgroundColor = getStatusColor(status.status);
//                                 cellStyle.color = 'white';
//                                 cellStyle.fontWeight = '500';
                                
//                                 if (status.isStart) {
//                                   cellContent = `#${status.id}`;
//                                 }
//                               } else {
//                                 cellStyle.backgroundColor = 'transparent';
//                               }
                              
//                               return (
//                                 <td 
//                                   key={idx} 
//                                   style={cellStyle}
//                                   onClick={() => handleCellClick(machine, date)}
//                                   title={status ? 
//                                     `Booking #${status.id} - ${status.status === 'blocked' ? 'Manual Booking' : 'System Booking'} (Click to cancel)` : 
//                                     'Click to create booking'}
//                                 >
//                                   {cellContent}
//                                 </td>
//                               );
//                             })}
//                           </tr>
//                         ))
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               {/* Legend */}
//               <div style={{ 
//                 display: 'flex', 
//                 gap: '16px', 
//                 justifyContent: 'center', 
//                 flexWrap: 'wrap', 
//                 marginTop: '16px', 
//                 padding: '12px', 
//                 borderRadius: '4px', 
//                 margin: '16px 16px 0 16px',
//                 backgroundColor: '#f9fafb' 
//               }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                   <div style={{ 
//                     width: '12px', 
//                     height: '12px', 
//                     borderRadius: '2px', 
//                     backgroundColor: '#3B82F6' 
//                   }}></div>
//                   <span style={{ fontSize: '12px', color: '#374151' }}>System Booking</span>
//                 </div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                   <div style={{ 
//                     width: '12px', 
//                     height: '12px', 
//                     borderRadius: '2px', 
//                     backgroundColor: '#10b981' 
//                   }}></div>
//                   <span style={{ fontSize: '12px', color: '#374151' }}>Manual Booking</span>
//                 </div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                   <div style={{ 
//                     width: '12px', 
//                     height: '12px', 
//                     borderRadius: '2px', 
//                     backgroundColor: '#ef4444' 
//                   }}></div>
//                   <span style={{ fontSize: '12px', color: '#374151' }}>Cancelled</span>
//                 </div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                   <div style={{ 
//                     width: '12px', 
//                     height: '12px', 
//                     borderRadius: '2px', 
//                     backgroundColor: '#f59e0b' 
//                   }}></div>
//                   <span style={{ fontSize: '12px', color: '#374151' }}>Rescheduled</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Floating Action Button */}
//       <button
//         onClick={() => {
//           setSelectedSlot(null);
//           setBookingModal(true);
//         }}
//         style={{
//           position: 'fixed',
//           bottom: '24px',
//           right: '24px',
//           width: '48px',
//           height: '48px',
//           backgroundColor: '#2563eb',
//           color: 'white',
//           border: 'none',
//           borderRadius: '50%',
//           boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           cursor: 'pointer',
//           zIndex: 40
//         }}
//         title="Create new booking"
//       >
//         <Plus size={20} />
//       </button>

//       {/* Booking Modal */}
//       {bookingModal && (
//         <div style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: 'rgba(0, 0, 0, 0.5)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '16px',
//           zIndex: 50
//         }}>
//           <div style={{
//             backgroundColor: 'white',
//             borderRadius: '8px',
//             boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
//             maxWidth: '448px',
//             width: '100%',
//             maxHeight: '90vh',
//             overflowY: 'auto'
//           }}>
//             <div style={{
//               backgroundColor: '#2563eb',
//               color: 'white',
//               padding: '16px',
//               borderTopLeftRadius: '8px',
//               borderTopRightRadius: '8px'
//             }}>
//               <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Create Manual Booking</h2>
//               <p style={{ fontSize: '14px', color: 'rgba(219, 234, 254, 1)', margin: '4px 0 0 0' }}>
//                 Block machine slot manually
//               </p>
//             </div>
            
//             <div style={{ padding: '16px' }}>
//               {selectedSlot && (
//                 <div style={{
//                   marginBottom: '16px',
//                   padding: '12px',
//                   backgroundColor: '#eff6ff',
//                   borderRadius: '4px',
//                   borderLeft: '4px solid #3b82f6'
//                 }}>
//                   <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', margin: '0 0 4px 0' }}>
//                     <strong>Machine ID:</strong> {selectedSlot.machineId}
//                   </p>
//                   <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
//                     <strong>Selected Date:</strong> {selectedSlot.date.toLocaleDateString()}
//                   </p>
//                 </div>
//               )}
              
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//                 {!selectedSlot && (
//                   <div>
//                     <label style={{ 
//                       display: 'block', 
//                       fontSize: '14px', 
//                       fontWeight: '500', 
//                       marginBottom: '4px',
//                       color: '#374151' 
//                     }}>
//                       Machine ID
//                     </label>
//                     <select
//                       style={{
//                         width: '100%',
//                         padding: '8px 12px',
//                         border: '1px solid #d1d5db',
//                         borderRadius: '6px',
//                         outline: 'none',
//                         backgroundColor: 'white',
//                         color: '#111827'
//                       }}
//                       value={bookingForm.machineid}
//                       onChange={(e) => setBookingForm({...bookingForm, machineid: parseInt(e.target.value)})}
//                     >
//                       <option value="">Select a machine...</option>
//                       {machines.map(machine => (
//                         <option key={machine} value={machine.replace('Machine_', '')}>
//                           Machine {machine.replace('Machine_', '')}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}
                
//                 <div>
//                   <label style={{ 
//                     display: 'block', 
//                     fontSize: '14px', 
//                     fontWeight: '500', 
//                     marginBottom: '4px',
//                     color: '#374151' 
//                   }}>
//                     Start Date 
//                   </label>
//                   <input
//                     type="text"
//                     value={bookingForm.plannedstartdatetime}
//                     onChange={(e) => setBookingForm({...bookingForm, plannedstartdatetime: e.target.value})}
//                     placeholder="YYYY-MM-DD HH:MM:SS"
//                     style={{
//                       width: '100%',
//                       padding: '8px 12px',
//                       border: '1px solid #d1d5db',
//                       borderRadius: '6px',
//                       outline: 'none',
//                       backgroundColor: 'white',
//                       color: '#111827'
//                     }}
//                   />
//                   <p style={{ fontSize: '12px', marginTop: '4px', color: '#6b7280' }}>
//                     Format: 2025-01-15 06:00:00
//                   </p>
//                 </div>
                
//                 <div>
//                   <label style={{ 
//                     display: 'block', 
//                     fontSize: '14px', 
//                     fontWeight: '500', 
//                     marginBottom: '4px',
//                     color: '#374151' 
//                   }}>
//                     End Date
//                   </label>
//                   <input
//                     type="text"
//                     value={bookingForm.plannedenddatetime}
//                     onChange={(e) => setBookingForm({...bookingForm, plannedenddatetime: e.target.value})}
//                     placeholder="YYYY-MM-DD HH:MM:SS"
//                     style={{
//                       width: '100%',
//                       padding: '8px 12px',
//                       border: '1px solid #d1d5db',
//                       borderRadius: '6px',
//                       outline: 'none',
//                       backgroundColor: 'white',
//                       color: '#111827'
//                     }}
//                   />
//                   <p style={{ fontSize: '12px', marginTop: '4px', color: '#6b7280' }}>
//                     Format: 2025-01-16 18:00:00
//                   </p>
//                 </div>
                
//                 <div>
//                   <label style={{ 
//                     display: 'block', 
//                     fontSize: '14px', 
//                     fontWeight: '500', 
//                     marginBottom: '4px',
//                     color: '#374151' 
//                   }}>
//                     Notes
//                   </label>
//                   <textarea
//                     value={bookingForm.notes}
//                     onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
//                     placeholder="Add any notes for this booking..."
//                     rows={3}
//                     style={{
//                       width: '100%',
//                       padding: '8px 12px',
//                       border: '1px solid #d1d5db',
//                       borderRadius: '6px',
//                       outline: 'none',
//                       backgroundColor: 'white',
//                       color: '#111827',
//                       resize: 'vertical'
//                     }}
//                   />
//                 </div>
                
//                 <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
//                   <button
//                     onClick={handleBookingSubmit}
//                     disabled={submitting || !bookingForm.machineid || !bookingForm.plannedstartdatetime || !bookingForm.plannedenddatetime}
//                     style={{
//                       flex: 1,
//                       backgroundColor: '#2563eb',
//                       color: 'white',
//                       padding: '12px 16px',
//                       border: 'none',
//                       borderRadius: '6px',
//                       fontWeight: '500',
//                       cursor: submitting ? 'not-allowed' : 'pointer',
//                       opacity: (submitting || !bookingForm.machineid || !bookingForm.plannedstartdatetime || !bookingForm.plannedenddatetime) ? 0.5 : 1,
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       gap: '8px'
//                     }}
//                   >
//                     {submitting ? (
//                       <>
//                         <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
//                         Creating...
//                       </>
//                     ) : 'Block Slot'}
//                   </button>
//                   <button
//                     onClick={() => {
//                       setBookingModal(false);
//                       setSelectedSlot(null);
//                       setBookingForm({
//                         machineid: '',
//                         plannedstartdatetime: '',
//                         plannedenddatetime: '',
//                         notes: ''
//                       });
//                     }}
//                     style={{
//                       flex: 1,
//                       padding: '12px 16px',
//                       border: 'none',
//                       borderRadius: '6px',
//                       fontWeight: '500',
//                       cursor: 'pointer',
//                       backgroundColor: '#f3f4f6',
//                       color: '#374151'
//                     }}
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Cancel Booking Modal */}
//       {cancelModal && selectedBooking && (
//         <div style={{
//           position: 'fixed',
//           top: 0,
//           left: 0,
//           right: 0,
//           bottom: 0,
//           backgroundColor: 'rgba(0, 0, 0, 0.5)',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '16px',
//           zIndex: 50
//         }}>
//           <div style={{
//             backgroundColor: 'white',
//             borderRadius: '8px',
//             boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
//             maxWidth: '448px',
//             width: '100%',
//             maxHeight: '90vh',
//             overflowY: 'auto'
//           }}>
//             <div style={{
//               backgroundColor: '#ef4444',
//               color: 'white',
//               padding: '16px',
//               borderTopLeftRadius: '8px',
//               borderTopRightRadius: '8px'
//             }}>
//               <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
//                 <Trash2 size={20} />
//                 Cancel Booking
//               </h2>
//               <p style={{ fontSize: '14px', color: 'rgba(254, 202, 202, 1)', margin: '4px 0 0 0' }}>
//                 Remove this booking from the calendar
//               </p>
//             </div>
            
//             <div style={{ padding: '16px' }}>
//               <div style={{
//                 marginBottom: '16px',
//                 padding: '12px',
//                 backgroundColor: '#fef2f2',
//                 borderRadius: '4px',
//                 borderLeft: '4px solid #ef4444'
//               }}>
//                 <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', margin: '0 0 4px 0' }}>
//                   <strong>Booking ID:</strong> #{selectedBooking.id}
//                 </p>
//                 <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>
//                   <strong>Machine:</strong> {selectedBooking.id ? machines.find(m => m.includes(''))?.replace('Machine_', '') || 'Unknown' : 'Unknown'}
//                 </p>
//                 <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>
//                   <strong>Duration:</strong> {selectedBooking.start?.toLocaleDateString()} - {selectedBooking.end?.toLocaleDateString()}
//                 </p>
//                 <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
//                   <strong>Type:</strong> {selectedBooking.status === 'blocked' ? 'Manual Booking' : 'System Booking'}
//                 </p>
//               </div>
              
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//                 <div>
//                   <label style={{ 
//                     display: 'block', 
//                     fontSize: '14px', 
//                     fontWeight: '500', 
//                     marginBottom: '4px',
//                     color: '#374151' 
//                   }}>
//                     Cancellation Reason *
//                   </label>
//                   <textarea
//                     value={cancelForm.reason}
//                     onChange={(e) => setCancelForm({...cancelForm, reason: e.target.value})}
//                     placeholder="Please provide a reason for cancelling this booking..."
//                     rows={4}
//                     style={{
//                       width: '100%',
//                       padding: '8px 12px',
//                       border: '1px solid #d1d5db',
//                       borderRadius: '6px',
//                       outline: 'none',
//                       backgroundColor: 'white',
//                       color: '#111827',
//                       resize: 'vertical'
//                     }}
//                   />
//                 </div>
                
//                 <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
//                   <button
//                     onClick={handleBookingCancel}
//                     disabled={submitting || !cancelForm.reason.trim()}
//                     style={{
//                       flex: 1,
//                       backgroundColor: '#ef4444',
//                       color: 'white',
//                       padding: '12px 16px',
//                       border: 'none',
//                       borderRadius: '6px',
//                       fontWeight: '500',
//                       cursor: submitting || !cancelForm.reason.trim() ? 'not-allowed' : 'pointer',
//                       opacity: submitting || !cancelForm.reason.trim() ? 0.5 : 1,
//                       display: 'flex',
//                       alignItems: 'center',
//                       justifyContent: 'center',
//                       gap: '8px'
//                     }}
//                   >
//                     {submitting ? (
//                       <>
//                         <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
//                         Cancelling...
//                       </>
//                     ) : (
//                       <>
//                         <Trash2 size={16} />
//                         Cancel Booking
//                       </>
//                     )}
//                   </button>
//                   <button
//                     onClick={() => {
//                       setCancelModal(false);
//                       setSelectedBooking(null);
//                       setCancelForm({ reason: '' });
//                     }}
//                     style={{
//                       flex: 1,
//                       padding: '12px 16px',
//                       border: 'none',
//                       borderRadius: '6px',
//                       fontWeight: '500',
//                       cursor: 'pointer',
//                       backgroundColor: '#f3f4f6',
//                       color: '#374151'
//                     }}
//                   >
//                     Keep Booking
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MachineBookingSystem;

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, RefreshCw, Search, Download, CheckCircle, XCircle, AlertCircle, Info, Activity, TrendingUp, BarChart3, Zap, Shield, Sun, Moon, Loader, Trash2 } from 'lucide-react';

const MachineBookingSystem = () => {
  // Core States
  const [viewDays, setViewDays] = useState(7);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState({});
  const [machines, setMachines] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const refreshInterval = useRef(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    cancelledBookings: 0,
    changeOfDateBookings: 0,
    blockedBookings: 0,
    totalMachines: 0,
    availableMachines: 0,
    utilizationRate: 0
  });

  const [bookingForm, setBookingForm] = useState({ 
    machineid: '',
    plannedstartdatetime: '',
    plannedenddatetime: '',
    notes: ''
  });

  const [cancelForm, setCancelForm] = useState({
    reason: ''
  });

  // Generate mock data for testing
  const generateMockData = useCallback(() => {
    console.log('Generating mock data for testing...');
    // Using actual machine IDs from API response instead of mock ones
    const apiMachineIds = [5019, 5032, 5048, 5112, 5119, 5124, 5127, 5131, 5138, 5139, 5145, 5147, 5149, 5152, 5155];
    const mockBookings = {};
    
    apiMachineIds.forEach((machineId, index) => {
      const machineKey = `Machine_${machineId}`;
      mockBookings[machineKey] = [];
      
      // Add some random bookings for demonstration
      if (index % 4 === 0) { // Add booking to every 4th machine
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 10));
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 5) + 1);
        
        // Mix of blocked (manual) and accepted (backend) bookings
        const isManualBooking = Math.random() > 0.5;
        
        mockBookings[machineKey].push({
          id: 100 + index,
          start: startDate,
          end: endDate,
          status: isManualBooking ? 'blocked' : 'accepted',
          type: isManualBooking ? 'blocked' : 'booking',
          description: `${isManualBooking ? 'Manual' : 'System'} Booking #${100 + index} for Machine ${machineId}`,
          hirerCompany: 1025,
          renterCompany: 1031,
          quoteId: isManualBooking ? null : 2000 + index,
          notes: isManualBooking ? 'Manually created booking' : 'System generated booking'
        });
      }
    });
    
    setMachines(apiMachineIds.map(id => `Machine_${id}`));
    setBookings(mockBookings);
    
    // Calculate stats
    const allBookings = Object.values(mockBookings).flat();
    const totalBookings = allBookings.length;
    const activeBookings = allBookings.filter(b => b.status === 'accepted').length;
    const blockedBookings = allBookings.filter(b => b.status === 'blocked').length;
    
    setStats({
      totalBookings,
      activeBookings,
      blockedBookings,
      cancelledBookings: 0,
      changeOfDateBookings: 0,
      totalMachines: apiMachineIds.length,
      availableMachines: apiMachineIds.length - totalBookings,
      utilizationRate: Math.round((totalBookings / apiMachineIds.length) * 100)
    });
    
    setLoading(false);
    console.log('Demo data loaded successfully with blocked/accepted bookings');
  }, []);

  // Fetch bookings from API
  const fetchBookings = useCallback(async () => {
    console.log('Fetching bookings from API...');
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call - replace with actual axios call
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            data: {
              results: [
                {
                  booking_id: 282,
                  machine_id: 5148,
                  actual_start_date_time: "2025-08-14T07:01:00.000Z",
                  actual_end_date_time: "2025-08-16T05:01:00.000Z",
                  booking_status: "accepted",
                  hirer_company_id: 1025,
                  renter_company_id: 1040,
                  quote_id: 2464,
                  cancelled_reason: "",
                  rescheduled_reason: ""
                },
                // Add more sample data with blocked status
                {
                  booking_id: 283,
                  machine_id: 5019,
                  actual_start_date_time: "2025-08-15T08:00:00.000Z",
                  actual_end_date_time: "2025-08-17T17:00:00.000Z",
                  booking_status: "blocked",
                  hirer_company_id: null,
                  renter_company_id: null,
                  quote_id: null,
                  cancelled_reason: "",
                  rescheduled_reason: ""
                }
              ]
            }
          });
        }, 1000);
      });
      
      console.log('API Response:', response);
      
      if (response && response.data && response.data.results && Array.isArray(response.data.results)) {
        const processedBookings = {};
        const uniqueMachines = new Set();
        let totalBookingsCount = 0;
        let activeBookingsCount = 0;
        let blockedBookingsCount = 0;
        let cancelledBookingsCount = 0;
        let changeOfDateCount = 0;
        
        response.data.results.forEach(booking => {
          const machineKey = `Machine_${booking.machine_id}`;
          uniqueMachines.add(machineKey);
          
          if (!processedBookings[machineKey]) {
            processedBookings[machineKey] = [];
          }
          
          const startDate = new Date(booking.actual_start_date_time);
          const endDate = new Date(booking.actual_end_date_time);
          
          const bookingData = {
            id: booking.booking_id,
            start: startDate,
            end: endDate,
            status: booking.booking_status,
            type: booking.booking_status,
            description: `Booking #${booking.booking_id}${booking.quote_id ? ` - Quote #${booking.quote_id}` : ''}`,
            hirerCompany: booking.hirer_company_id,
            renterCompany: booking.renter_company_id,
            cancelledReason: booking.cancelled_reason || '',
            rescheduledReason: booking.rescheduled_reason || '',
            quoteId: booking.quote_id,
            notes: booking.booking_status === 'blocked' ? 'Manually blocked slot' : 'System booking'
          };
          
          processedBookings[machineKey].push(bookingData);
          totalBookingsCount++;
          
          if (booking.booking_status === 'accepted') {
            activeBookingsCount++;
          } else if (booking.booking_status === 'blocked') {
            blockedBookingsCount++;
          } else if (booking.booking_status === 'cancelled') {
            cancelledBookingsCount++;
          } else if (booking.booking_status === 'change_of_date') {
            changeOfDateCount++;
          }
        });
        
        setBookings(processedBookings);
        const sortedMachines = Array.from(uniqueMachines).sort((a, b) => {
          const numA = parseInt(a.replace('Machine_', ''));
          const numB = parseInt(b.replace('Machine_', ''));
          return numA - numB;
        });
        setMachines(sortedMachines);
        
        const totalMachinesCount = uniqueMachines.size;
        const utilizationRate = totalMachinesCount > 0 ? 
          Math.round(((activeBookingsCount + blockedBookingsCount) / totalMachinesCount) * 100) : 0;
        
        setStats({
          totalBookings: totalBookingsCount,
          activeBookings: activeBookingsCount,
          blockedBookings: blockedBookingsCount,
          cancelledBookings: cancelledBookingsCount,
          changeOfDateBookings: changeOfDateCount,
          totalMachines: totalMachinesCount,
          availableMachines: totalMachinesCount - activeBookingsCount - blockedBookingsCount,
          utilizationRate
        });

        console.log(`Loaded ${totalBookingsCount} bookings for ${totalMachinesCount} machines`);
      } else {
        console.warn('No valid data received from API, using mock data');
        generateMockData();
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('API connection failed. Using demo data.');
      generateMockData();
    } finally {
      setLoading(false);
    }
  }, [generateMockData]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      refreshInterval.current = setInterval(fetchBookings, 60000);
      return () => {
        if (refreshInterval.current) {
          clearInterval(refreshInterval.current);
        }
      };
    }
  }, [autoRefresh, fetchBookings]);

  // Initial fetch
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Filtered machines
  const filteredMachines = useMemo(() => {
    if (!searchQuery) return machines;
    
    return machines.filter(machine => {
      const machineNumber = machine.replace('Machine_', '');
      return machineNumber.includes(searchQuery) || 
             machine.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [machines, searchQuery]);

  // Get dates for current view
  const getDates = () => {
    const dates = [];
    for (let i = 0; i < viewDays; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDateTime = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day} 06:00:00`;
  };

  // Navigation
  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      // Single step: go to previous day
      newDate.setDate(currentDate.getDate() - 1);
    } else if (direction === 'next') {
      // Single step: go to next day
      newDate.setDate(currentDate.getDate() + 1);
    } else if (direction === 'prevFast') {
      // Fast navigation: go back by current view period
      const multiplier = viewDays;
      newDate.setDate(currentDate.getDate() - multiplier);
    } else if (direction === 'nextFast') {
      // Fast navigation: go forward by current view period
      const multiplier = viewDays;
      newDate.setDate(currentDate.getDate() + multiplier);
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get cell status for a specific machine and date
  const getCellStatus = (machine, date) => {
    const machineBookings = bookings[machine] || [];
    for (const booking of machineBookings) {
      const cellDate = new Date(date);
      cellDate.setHours(0, 0, 0, 0);
      const startDate = new Date(booking.start);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(booking.end);
      endDate.setHours(0, 0, 0, 0);
      
      if (cellDate >= startDate && cellDate <= endDate) {
        return {
          ...booking,
          isStart: cellDate.getTime() === startDate.getTime(),
          isEnd: cellDate.getTime() === endDate.getTime()
        };
      }
    }
    return null;
  };

  // Handle cell click
  const handleCellClick = (machine, date) => {
    const existingBooking = getCellStatus(machine, date);
    if (!existingBooking) {
      // Create new booking
      const machineId = machine.replace('Machine_', '');
      setSelectedSlot({ machine, machineId, date });
      
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      setBookingForm({
        machineid: parseInt(machineId),
        plannedstartdatetime: formatDateTime(startDate),
        plannedenddatetime: formatDateTime(endDate),
        notes: ''
      });
      
      setBookingModal(true);
    } else {
      // Show cancel modal for existing booking
      setSelectedBooking(existingBooking);
      setCancelForm({ reason: '' });
      setCancelModal(true);
    }
  };

  // Submit booking
  const handleBookingSubmit = async () => {
    if (!bookingForm.machineid || !bookingForm.plannedstartdatetime || !bookingForm.plannedenddatetime) {
      console.log('Please fill in all required fields');
      return;
    }

    const startDate = new Date(bookingForm.plannedstartdatetime);
    const endDate = new Date(bookingForm.plannedenddatetime);
    
    if (endDate <= startDate) {
      console.log('End date must be after start date');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Creating booking with payload:', {
        ...bookingForm,
        booking_status: 'blocked' // Manual bookings are blocked
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await fetchBookings();
      setBookingModal(false);
      setSelectedSlot(null);
      setBookingForm({
        machineid: '',
        plannedstartdatetime: '',
        plannedenddatetime: '',
        notes: ''
      });
      
      console.log('Booking created successfully!');
      
    } catch (err) {
      console.error('Error creating booking:', err);
      console.log(`Failed to create booking: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel booking
  const handleBookingCancel = async () => {
    if (!cancelForm.reason.trim()) {
      console.log('Please provide a reason for cancellation');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Cancelling booking:', selectedBooking.id, 'Reason:', cancelForm.reason);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await fetchBookings();
      setCancelModal(false);
      setSelectedBooking(null);
      setCancelForm({ reason: '' });
      
      console.log('Booking cancelled successfully!');
      
    } catch (err) {
      console.error('Error cancelling booking:', err);
      console.log(`Failed to cancel booking: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Export data
  const exportData = () => {
    const csvHeader = "Machine ID,Booking ID,Start Date,End Date,Status,Hirer Company,Renter Company,Quote ID,Notes\n";
    const csvContent = Object.entries(bookings).flatMap(([machine, machineBookings]) =>
      machineBookings.map(booking => 
        `${machine.replace('Machine_', '')},${booking.id},${booking.start.toISOString()},${booking.end.toISOString()},${booking.status},${booking.hirerCompany || ''},${booking.renterCompany || ''},${booking.quoteId || ''},"${booking.notes || ''}"`
      )
    ).join("\n");
    
    const fullCsvContent = "data:text/csv;charset=utf-8," + csvHeader + csvContent;
    const encodedUri = encodeURI(fullCsvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `machine_bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('Booking data exported to CSV');
  };

  const dates = getDates();
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#3B82F6'; // Blue for backend/system bookings
      case 'blocked': return '#10B981';  // Green for manual bookings
      case 'cancelled': return '#EF4444';
      case 'change_of_date': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '6px', 
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', 
        marginBottom: '16px' 
      }}>
        <div style={{ 
          backgroundColor: '#2563eb', 
          color: 'white', 
          padding: '16px', 
          borderTopLeftRadius: '6px',
          borderTopRightRadius: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Machine Booking Calendar</h1>
              <p style={{ color: 'rgba(219, 234, 254, 1)', fontSize: '14px', margin: '4px 0 0 0' }}>Resource Management & Scheduling</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={exportData}
                style={{ 
                  padding: '8px', 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Export CSV"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Dashboard - Commented out */}
        {/* {showStats && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '8px', 
            padding: '12px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ textAlign: 'center', padding: '8px', borderRadius: '6px', backgroundColor: '#6366f1', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                <Activity size={16} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.totalBookings}</div>
              <div style={{ fontSize: '12px' }}>Total</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', borderRadius: '6px', backgroundColor: '#3B82F6', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                <CheckCircle size={16} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.activeBookings}</div>
              <div style={{ fontSize: '12px' }}>System</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', borderRadius: '6px', backgroundColor: '#10b981', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                <Shield size={16} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.blockedBookings}</div>
              <div style={{ fontSize: '12px' }}>Manual</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', borderRadius: '6px', backgroundColor: '#ef4444', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                <XCircle size={16} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.cancelledBookings}</div>
              <div style={{ fontSize: '12px' }}>Cancelled</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', borderRadius: '6px', backgroundColor: '#f59e0b', color: 'white' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.changeOfDateBookings}</div>
              <div style={{ fontSize: '12px' }}>Rescheduled</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', borderRadius: '6px', backgroundColor: '#14b8a6', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                <Zap size={16} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.availableMachines}</div>
              <div style={{ fontSize: '12px' }}>Available</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px', borderRadius: '6px', backgroundColor: '#8b5cf6', color: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                <TrendingUp size={16} />
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.utilizationRate}%</div>
              <div style={{ fontSize: '12px' }}>Utilization</div>
            </div>
          </div>
        )} */}

        {/* Search and Controls */}
        <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search machines (e.g., 5121, 5152)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '36px',
                  paddingRight: '16px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  fontSize: '14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  outline: 'none',
                  backgroundColor: 'white',
                  color: '#111827'
                }}
              />
            </div>
          </div>
        </div>

        {/* View Controls */}
        <div style={{ 
          padding: '12px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          gap: '12px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>
            {viewDays === 1 ? 'Today View' : `${viewDays} Days View`} ({filteredMachines.length} machines)
          </div>
          
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
            <button
              onClick={() => setViewDays(1)}
              style={{
                padding: '6px 16px',
                fontSize: '13px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                backgroundColor: viewDays === 1 ? '#2563eb' : 'transparent',
                color: viewDays === 1 ? 'white' : '#374151',
                transition: 'all 0.2s'
              }}
            >
              Today
            </button>
            <button
              onClick={() => setViewDays(7)}
              style={{
                padding: '6px 16px',
                fontSize: '13px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                backgroundColor: viewDays === 7 ? '#2563eb' : 'transparent',
                color: viewDays === 7 ? 'white' : '#374151',
                transition: 'all 0.2s'
              }}
            >
              7 Days
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca', 
            color: '#b91c1c',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertCircle size={16} />
            <span style={{ flex: '1' }}>{error}</span>
            <button 
              onClick={fetchBookings} 
              style={{
                padding: '4px 12px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
              disabled={loading}
            >
              {loading ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <Loader size={20} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
              <span style={{ color: '#6b7280' }}>Loading booking data...</span>
            </div>
          </div>
        )}

        {/* Calendar Grid */}
        {!loading && (
          <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
            <div style={{ minWidth: '100%' }}>
              {/* Navigation Header */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '16px', 
                padding: '0 16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                margin: '0 16px 16px 16px',
                paddingTop: '12px',
                paddingBottom: '12px'
              }}>
                {/* Navigation Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => navigate('prevFast')}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                      transition: 'all 0.2s'
                    }}
                    title={`Previous ${viewDays === 1 ? 'day' : `${viewDays} days`}`}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                    }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>�</span>
                    <span>{viewDays === 1 ? 'Prev Day' : 'Prev'}</span>
                  </button>
                  <button
                    onClick={() => navigate('prev')}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                      transition: 'all 0.2s'
                    }}
                    title="Previous day"
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                    }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>9</span>
                  </button>
                </div>
                
                {/* Current Period Display */}
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                    {viewDays === 1 
                      ? currentDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })
                      : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    }
                  </h2>
                  {viewDays > 1 && (
                    <p style={{ fontSize: '14px', color: '#6b7280', margin: '2px 0 0 0' }}>
                      {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
                      {(() => {
                        const endDate = new Date(currentDate);
                        endDate.setDate(currentDate.getDate() + viewDays - 1);
                        return endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      })()}
                    </p>
                  )}
                </div>
                
                {/* Forward Navigation */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => navigate('next')}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                      transition: 'all 0.2s'
                    }}
                    title="Next day"
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                    }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>:</span>
                  </button>
                  <button
                    onClick={() => navigate('nextFast')}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      backgroundColor: 'white',
                      color: '#374151',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '14px',
                      fontWeight: '500',
                      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                      transition: 'all 0.2s'
                    }}
                    title={`Next ${viewDays === 1 ? 'day' : `${viewDays} days`}`}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#f3f4f6';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'white';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                    }}
                  >
                    <span>{viewDays === 1 ? 'Next Day' : 'Next'}</span>
                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>�</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div style={{ 
                overflow: 'hidden', 
                borderRadius: '4px', 
                border: '1px solid #d1d5db', 
                margin: '0 16px' 
              }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse', 
                    minWidth: '800px',
                    fontSize: '14px'
                  }}>
                    <thead>
                      <tr>
                        <th style={{
                          border: '1px solid #d1d5db',
                          padding: '12px',
                          textAlign: 'left',
                          fontWeight: '500',
                          width: '96px',
                          position: 'sticky',
                          left: 0,
                          zIndex: 20,
                          backgroundColor: '#f9fafb',
                          color: '#374151'
                        }}>
                          Machine ID
                        </th>
                        {dates.map((date, idx) => (
                          <th 
                            key={idx} 
                            style={{
                              border: '1px solid #d1d5db',
                              padding: '8px',
                              textAlign: 'center',
                              fontWeight: '500',
                              minWidth: '70px',
                              backgroundColor: isToday(date) 
                                ? '#2563eb' 
                                : isWeekend(date)
                                  ? '#f3f4f6'
                                  : '#f9fafb',
                              color: isToday(date) 
                                ? 'white' 
                                : isWeekend(date)
                                  ? '#6b7280'
                                  : '#374151'
                            }}
                          >
                            <div style={{ fontSize: '12px' }}>
                              {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                              {date.getDate()}-{date.toLocaleString('en', { month: 'short' })}
                            </div>
                            {isToday(date) && (
                              <div style={{ fontSize: '12px', opacity: '0.75' }}>Today</div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMachines.length === 0 ? (
                        <tr>
                          <td colSpan={dates.length + 1} style={{ 
                            textAlign: 'center', 
                            padding: '32px', 
                            color: '#6b7280' 
                          }}>
                            {searchQuery ? 'No machines found matching your search' : 'No machines available'}
                          </td>
                        </tr>
                      ) : (
                        filteredMachines.map((machine) => (
                          <tr key={machine} style={{ backgroundColor: 'transparent' }}>
                            <td style={{
                              border: '1px solid #d1d5db',
                              padding: '12px',
                              fontWeight: '500',
                              fontSize: '14px',
                              position: 'sticky',
                              left: 0,
                              zIndex: 10,
                              backgroundColor: '#f9fafb',
                              color: '#374151'
                            }}>
                              {machine.replace('Machine_', '')}
                            </td>
                            {dates.map((date, idx) => {
                              const status = getCellStatus(machine, date);
                              let cellStyle = {
                                border: '1px solid #d1d5db',
                                padding: '4px',
                                height: '40px',
                                position: 'relative',
                                cursor: 'pointer',
                                fontSize: '12px',
                                textAlign: 'center'
                              };
                              let cellContent = null;
                              
                              if (status) {
                                cellStyle.backgroundColor = getStatusColor(status.status);
                                cellStyle.color = 'white';
                                cellStyle.fontWeight = '500';
                                
                                if (status.isStart) {
                                  cellContent = `#${status.id}`;
                                }
                              } else {
                                cellStyle.backgroundColor = 'transparent';
                              }
                              
                              return (
                                <td 
                                  key={idx} 
                                  style={cellStyle}
                                  onClick={() => handleCellClick(machine, date)}
                                  title={status ? 
                                    `Booking #${status.id} - ${status.status === 'blocked' ? 'Manual Booking' : 'System Booking'} (Click to cancel)` : 
                                    'Click to create booking'}
                                >
                                  {cellContent}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Legend */}
              <div style={{ 
                display: 'flex', 
                gap: '16px', 
                justifyContent: 'center', 
                flexWrap: 'wrap', 
                marginTop: '16px', 
                padding: '12px', 
                borderRadius: '4px', 
                margin: '16px 16px 0 16px',
                backgroundColor: '#f9fafb' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '2px', 
                    backgroundColor: '#3B82F6' 
                  }}></div>
                  <span style={{ fontSize: '12px', color: '#374151' }}>System Booking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '2px', 
                    backgroundColor: '#10b981' 
                  }}></div>
                  <span style={{ fontSize: '12px', color: '#374151' }}>Manual Booking</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '2px', 
                    backgroundColor: '#ef4444' 
                  }}></div>
                  <span style={{ fontSize: '12px', color: '#374151' }}>Cancelled</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    borderRadius: '2px', 
                    backgroundColor: '#f59e0b' 
                  }}></div>
                  <span style={{ fontSize: '12px', color: '#374151' }}>Rescheduled</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          setSelectedSlot(null);
          setBookingModal(true);
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '48px',
          height: '48px',
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 40
        }}
        title="Create new booking"
      >
        <Plus size={20} />
      </button>

      {/* Booking Modal */}
      {bookingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
            maxWidth: '448px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '16px',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Create Manual Booking</h2>
              <p style={{ fontSize: '14px', color: 'rgba(219, 234, 254, 1)', margin: '4px 0 0 0' }}>
                Block machine slot manually
              </p>
            </div>
            
            <div style={{ padding: '16px' }}>
              {selectedSlot && (
                <div style={{
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '4px',
                  borderLeft: '4px solid #3b82f6'
                }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', margin: '0 0 4px 0' }}>
                    <strong>Machine ID:</strong> {selectedSlot.machineId}
                  </p>
                  <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                    <strong>Selected Date:</strong> {selectedSlot.date.toLocaleDateString()}
                  </p>
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {!selectedSlot && (
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '4px',
                      color: '#374151' 
                    }}>
                      Machine ID
                    </label>
                    <select
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        outline: 'none',
                        backgroundColor: 'white',
                        color: '#111827'
                      }}
                      value={bookingForm.machineid}
                      onChange={(e) => setBookingForm({...bookingForm, machineid: parseInt(e.target.value)})}
                    >
                      <option value="">Select a machine...</option>
                      {machines.map(machine => (
                        <option key={machine} value={machine.replace('Machine_', '')}>
                          Machine {machine.replace('Machine_', '')}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '4px',
                    color: '#374151' 
                  }}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={bookingForm.plannedstartdatetime ? bookingForm.plannedstartdatetime.split(' ')[0] : ''}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      if (dateValue) {
                        setBookingForm({...bookingForm, plannedstartdatetime: `${dateValue} 06:00:00`});
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      outline: 'none',
                      backgroundColor: 'white',
                      color: '#111827'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '4px',
                    color: '#374151' 
                  }}>
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={bookingForm.plannedenddatetime ? bookingForm.plannedenddatetime.split(' ')[0] : ''}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      if (dateValue) {
                        setBookingForm({...bookingForm, plannedenddatetime: `${dateValue} 18:00:00`});
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      outline: 'none',
                      backgroundColor: 'white',
                      color: '#111827'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '4px',
                    color: '#374151' 
                  }}>
                    Notes
                  </label>
                  <textarea
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                    placeholder="Add any notes for this booking..."
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      outline: 'none',
                      backgroundColor: 'white',
                      color: '#111827',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
                  <button
                    onClick={handleBookingSubmit}
                    disabled={submitting || !bookingForm.machineid || !bookingForm.plannedstartdatetime || !bookingForm.plannedenddatetime}
                    style={{
                      flex: 1,
                      backgroundColor: '#2563eb',
                      color: 'white',
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '500',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: (submitting || !bookingForm.machineid || !bookingForm.plannedstartdatetime || !bookingForm.plannedenddatetime) ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Creating...
                      </>
                    ) : 'Block Slot'}
                  </button>
                  <button
                    onClick={() => {
                      setBookingModal(false);
                      setSelectedSlot(null);
                      setBookingForm({
                        machineid: '',
                        plannedstartdatetime: '',
                        plannedenddatetime: '',
                        notes: ''
                      });
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      backgroundColor: '#f3f4f6',
                      color: '#374151'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {cancelModal && selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          zIndex: 50
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
            maxWidth: '448px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '16px',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={20} />
                Cancel Booking
              </h2>
              <p style={{ fontSize: '14px', color: 'rgba(254, 202, 202, 1)', margin: '4px 0 0 0' }}>
                Remove this booking from the calendar
              </p>
            </div>
            
            <div style={{ padding: '16px' }}>
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#fef2f2',
                borderRadius: '4px',
                borderLeft: '4px solid #ef4444'
              }}>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937', margin: '0 0 4px 0' }}>
                  <strong>Booking ID:</strong> #{selectedBooking.id}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>
                  <strong>Machine:</strong> {selectedBooking.id ? machines.find(m => m.includes(''))?.replace('Machine_', '') || 'Unknown' : 'Unknown'}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>
                  <strong>Duration:</strong> {selectedBooking.start?.toLocaleDateString()} - {selectedBooking.end?.toLocaleDateString()}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  <strong>Type:</strong> {selectedBooking.status === 'blocked' ? 'Manual Booking' : 'System Booking'}
                </p>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '4px',
                    color: '#374151' 
                  }}>
                    Cancellation Reason *
                  </label>
                  <textarea
                    value={cancelForm.reason}
                    onChange={(e) => setCancelForm({...cancelForm, reason: e.target.value})}
                    placeholder="Please provide a reason for cancelling this booking..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      outline: 'none',
                      backgroundColor: 'white',
                      color: '#111827',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '12px', paddingTop: '16px' }}>
                  <button
                    onClick={handleBookingCancel}
                    disabled={submitting || !cancelForm.reason.trim()}
                    style={{
                      flex: 1,
                      backgroundColor: '#ef4444',
                      color: 'white',
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '500',
                      cursor: submitting || !cancelForm.reason.trim() ? 'not-allowed' : 'pointer',
                      opacity: submitting || !cancelForm.reason.trim() ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Cancel Booking
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setCancelModal(false);
                      setSelectedBooking(null);
                      setCancelForm({ reason: '' });
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      backgroundColor: '#f3f4f6',
                      color: '#374151'
                    }}
                  >
                    Keep Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineBookingSystem;