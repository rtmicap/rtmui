import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, Download, Plus, Loader, Trash2, AlertCircle } from 'lucide-react';
import { Button } from 'antd';
import axios from '../../api/axios.js';
import { GET_ALL_BOOKINGS } from '../../api/apiUrls.js';
import { message } from 'antd';
import './MachineBookingSystem.scss';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [machineType, setMachineType] = useState('');
  const [machineCategory, setMachineCategory] = useState('');
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [categories, setCategories] = useState([]);
  const [machineTypes, setMachineTypes] = useState([]);
  const [categoryAndType, setCategoryAndType] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(false);
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

  // API URLs
  const GET_MACHINE_CAT_TYPE = "/machines/getMachinesByCatAndType";

  // Fetch machine categories and types
  const fetchMachineCategoriesAndTypes = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        axios.defaults.headers.common["authorization"] = "Bearer " + token;
      }
      
      const response = await axios.get(GET_MACHINE_CAT_TYPE);
      const machineCategories = response.data;
      console.log("Machine categories and types: ", machineCategories);
      
      setCategoryAndType(machineCategories);
      
      // Transform categories for dropdown
      const machineKeys = Object.keys(machineCategories);
      const categoryOptions = machineKeys.map(category => ({
        value: category,
        label: category
      }));
      setCategories(categoryOptions);
      
    } catch (error) {
      console.error('Error fetching machine categories and types:', error);
      message.error('Failed to load machine categories');
    }
  }, []);

  // Handle category change
  const handleCategoryChange = (value) => {
    setMachineCategory(value);
    setMachineType(''); // Reset machine type when category changes
    
    if (value && categoryAndType[value]) {
      const types = categoryAndType[value];
      const typeOptions = types.map(type => ({
        value: type,
        label: type
      }));
      setMachineTypes(typeOptions);
    } else {
      setMachineTypes([]);
    }
    
    // Clear machine ID selection when using other filters
    if (value) {
      setSelectedMachineId('');
    }
  };

  // Handle machine type change
  const handleMachineTypeChange = (value) => {
    setMachineType(value);
    // Clear machine ID selection when using other filters
    if (value) {
      setSelectedMachineId('');
    }
  };

  // Fetch bookings from API
  const fetchBookings = useCallback(async () => {
    console.log('Fetching bookings from API...');
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("authToken");
      if (token) {
        axios.defaults.headers.common["authorization"] = "Bearer " + token;
      }
      
      // Actual API call
      const response = await axios.get(GET_ALL_BOOKINGS);
      console.log("getAllBookings: ", response.data);
      
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
          
          console.log(`Processing booking ${booking.booking_id} with status: ${booking.booking_status}`); // Debug log
          
          const bookingData = {
            id: booking.booking_id,
            start: startDate,
            end: endDate,
            status: booking.booking_status, // This should be 'accepted', 'blocked', etc.
            type: booking.booking_status,
            description: `Booking #${booking.booking_id}${booking.quote_id ? ` - Quote #${booking.quote_id}` : ''}`,
            hirerCompany: booking.hirer_company_id,
            renterCompany: booking.renter_company_id,
            cancelledReason: booking.cancelled_reason || '',
            rescheduledReason: booking.rescheduled_reason || '',
            quoteId: booking.quote_id,
            notes: booking.booking_status === 'blocked' ? 'Manually blocked slot' : 'System booking',
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt
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

        message.success(`Loaded ${totalBookingsCount} bookings for ${totalMachinesCount} machines`);
        console.log(`Loaded ${totalBookingsCount} bookings for ${totalMachinesCount} machines`);
      } else {
        console.warn('No valid data received from API');
        message.warning('No booking data found');
        setMachines([]);
        setBookings({});
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to load booking data. Please check your connection and try again.');
      message.error('Failed to load booking data. Please check your connection and try again.');
      setMachines([]);
      setBookings({});
    } finally {
      setLoading(false);
    }
  }, []);

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
    fetchMachineCategoriesAndTypes();
  }, [fetchBookings, fetchMachineCategoriesAndTypes]);

  // Filtered machines
  const filteredMachines = useMemo(() => {
    let filtered = machines;
    
    // Filter by selected machine ID first
    if (selectedMachineId) {
      filtered = filtered.filter(machine => 
        machine.replace('Machine_', '') === selectedMachineId
      );
      return filtered; // Return only the selected machine
    }
    
    // Filter by search query
    if (searchQuery) {
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0);
      filtered = filtered.filter(machine => {
        const machineNumber = machine.replace('Machine_', '').toLowerCase();
        const machineName = machine.toLowerCase();
        return searchTerms.every(term => 
          machineNumber.includes(term) || machineName.includes(term)
        );
      });
    }
    
    // Filter by machine type
    if (machineType && !selectedMachineId) {
      console.log('Filtering by machine type:', machineType);
    }
    
    // Filter by machine category
    if (machineCategory && !selectedMachineId) {
      console.log('Filtering by machine category:', machineCategory);
    }
    
    return filtered;
  }, [machines, searchQuery, machineType, machineCategory, selectedMachineId]);

  // Helper functions
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

  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 1);
    } else if (direction === 'next') {
      newDate.setDate(currentDate.getDate() + 1);
    } else if (direction === 'prevFast') {
      const multiplier = viewDays;
      newDate.setDate(currentDate.getDate() - multiplier);
    } else if (direction === 'nextFast') {
      const multiplier = viewDays;
      newDate.setDate(currentDate.getDate() + multiplier);
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

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

  const handleCellClick = (machine, date) => {
    const existingBooking = getCellStatus(machine, date);
    if (!existingBooking) {
      const machineId = machine.replace('Machine_', '');
      setSelectedSlot({ machine, machineId, date });
      
      setBookingForm({
        machineid: parseInt(machineId),
        plannedstartdatetime: '',
        plannedenddatetime: '',
        notes: ''
      });
      
      setBookingModal(true);
    } else {
      // Show cancel modal ONLY for manual bookings (blocked status)
      if (existingBooking.status === 'blocked') {
        setSelectedBooking(existingBooking);
        setCancelForm({ reason: '' });
        setCancelModal(true);
      } else {
        // For system bookings, show message - no cancel popup
        message.info(`System Booking${existingBooking.quoteId ? ` - Quote #${existingBooking.quoteId}` : ` #${existingBooking.id}`} - Cannot be cancelled manually`);
      }
    }
  };

  const handleBookingSubmit = async () => {
    if (!bookingForm.machineid || !bookingForm.plannedstartdatetime || !bookingForm.plannedenddatetime) {
      message.warning('Please fill in all required fields');
      return;
    }

    const startDate = new Date(bookingForm.plannedstartdatetime);
    const endDate = new Date(bookingForm.plannedenddatetime);
    
    if (endDate <= startDate) {
      message.warning('End date must be after start date');
      return;
    }

    setSubmitting(true);
    try {
      // Format dates properly for API
      const formatDateForAPI = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toISOString(); // Returns format like "2025-08-24T06:00:00.000Z"
      };

      const payload = {
        machine_id: parseInt(bookingForm.machineid), // Ensure it's a number
        actual_start_date_time: formatDateForAPI(bookingForm.plannedstartdatetime),
        actual_end_date_time: formatDateForAPI(bookingForm.plannedenddatetime),
        booking_status: 'blocked', // Manual bookings are blocked
        cancelled_reason: '',
        rescheduled_reason: '',
        // Add additional fields that might be required by your backend
        hirer_company_id: null, // Manual bookings might not have company IDs
        renter_company_id: null,
        quote_id: null,
        notes: bookingForm.notes || 'Manually created booking'
      };
      
      console.log('Creating booking with payload:', payload);
      console.log('Payload JSON:', JSON.stringify(payload, null, 2));
      
      const token = localStorage.getItem("authToken");
      if (token) {
        axios.defaults.headers.common["authorization"] = "Bearer " + token;
      }
      
      const response = await axios.post('/booking/createBooking', payload);
      console.log('Booking creation response:', response);
      
      await fetchBookings();
      setBookingModal(false);
      setSelectedSlot(null);
      setBookingForm({
        machineid: '',
        plannedstartdatetime: '',
        plannedenddatetime: '',
        notes: ''
      });
      
      message.success('Manual booking created successfully!');
      
    } catch (err) {
      console.error('Error creating booking:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error headers:', err.response?.headers);
      
      // Show detailed error message
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.response?.statusText || 
                          err.message || 
                          'Unknown error occurred';
      
      message.error(`Failed to create booking (${err.response?.status || 'Network Error'}): ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookingCancel = async () => {
    if (!cancelForm.reason.trim()) {
      message.warning('Please provide a reason for cancellation');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Cancelling booking:', selectedBooking.id, 'Reason:', cancelForm.reason);
      
      const token = localStorage.getItem("authToken");
      if (token) {
        axios.defaults.headers.common["authorization"] = "Bearer " + token;
      }
      
      const response = await axios.put(`/booking/updateBooking/${selectedBooking.id}`, {
        booking_status: 'cancelled',
        cancelled_reason: cancelForm.reason
      });
      console.log('Booking cancellation response:', response);
      
      await fetchBookings();
      setCancelModal(false);
      setSelectedBooking(null);
      setCancelForm({ reason: '' });
      
      message.success('Booking cancelled successfully!');
      
    } catch (err) {
      console.error('Error cancelling booking:', err);
      message.error(`Failed to cancel booking: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

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
    
    message.success('Booking data exported to CSV');
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
    console.log('Getting color for status:', status); // Debug log
    switch (status) {
      case 'accepted': 
        console.log('Returning green for accepted');
        return '#10B981'; // Green for system bookings
      case 'blocked': 
        console.log('Returning orange for blocked');
        return '#F97316';  // Orange for manual bookings
      case 'cancelled': 
        console.log('Returning red for cancelled');
        return '#EF4444';
      case 'change_of_date': 
        console.log('Returning yellow for change_of_date');
        return '#F59E0B';
      default: 
        console.log('Returning default grey for status:', status);
        return '#6B7280';
    }
  };

  return (
    <div className="machine-booking-system">
      {/* Header */}
      <div className="machine-booking-system__container">
        <div className="machine-booking-system__header">
          <div>
            <h1 className="machine-booking-system__header-title">Machine Booking Calendar</h1>
            <p className="machine-booking-system__header-subtitle">Resource Management & Scheduling</p>
          </div>
          <div className="machine-booking-system__header-actions">
            <Button 
              type="primary"
              icon={<Download size={16} />}
              onClick={exportData}
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white'
              }}
              title="Export CSV"
            />
          </div>
        </div>

        {/* Machine Filters */}
        <div className="machine-booking-system__filters">
          <div className="machine-booking-system__filters-row">
            <div className="machine-booking-system__filters-group">
              <label className="machine-booking-system__filters-label">Choose Machine ID</label>
              <select
                className="machine-booking-system__filters-select"
                value={selectedMachineId}
                onChange={(e) => {
                  setSelectedMachineId(e.target.value);
                  if (e.target.value) {
                    setSearchQuery('');
                    setMachineType('');
                    setMachineCategory('');
                  }
                }}
              >
                <option value="">All Machines</option>
                {machines.map(machine => {
                  const machineId = machine.replace('Machine_', '');
                  return (
                    <option key={machine} value={machineId}>
                      Machine {machineId}
                    </option>
                  );
                })}
              </select>
            </div>
            
            <div className="machine-booking-system__filters-group">
              <label className="machine-booking-system__filters-label">Choose Machine Category</label>
              <select
                className="machine-booking-system__filters-select"
                value={machineCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={selectedMachineId}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="machine-booking-system__filters-group">
              <label className="machine-booking-system__filters-label">Choose Machine Type</label>
              <select
                className="machine-booking-system__filters-select"
                value={machineType}
                onChange={(e) => handleMachineTypeChange(e.target.value)}
                disabled={selectedMachineId || !machineCategory}
              >
                <option value="">All Machine Types</option>
                {machineTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="machine-booking-system__filters">
          <div className="machine-booking-system__filters-search-container">
            <div className="machine-booking-system__filters-search-icon">
              <Search size={16} />
            </div>
            <input
              className="machine-booking-system__filters-input"
              type="text"
              placeholder="Search machines (e.g., 5121, 5152)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) {
                  setSelectedMachineId('');
                }
              }}
              disabled={selectedMachineId}
            />
            {selectedMachineId && (
              <div className="machine-booking-system__filters-search-hint">
                Machine {selectedMachineId} selected
              </div>
            )}
          </div>
        </div>

        {/* View Controls */}
        <div className="machine-booking-system__view-controls">
          <div className="machine-booking-system__view-controls-title">
            {viewDays === 1 ? 'Today View' : `${viewDays} Days View`} ({filteredMachines.length} machines)
          </div>
          
          <div className="machine-booking-system__view-controls-buttons">
            <Button
              type={viewDays === 1 ? "primary" : "default"}
              onClick={() => setViewDays(1)}
              size="small"
            >
              Today
            </Button>
            <Button
              type={viewDays === 7 ? "primary" : "default"}
              onClick={() => setViewDays(7)}
              size="small"
            >
              7 Days
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="machine-booking-system__error">
            <AlertCircle size={16} />
            <span className="machine-booking-system__error-content">{error}</span>
            <button 
              className="machine-booking-system__error-button"
              onClick={fetchBookings}
              disabled={loading}
            >
              {loading ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="machine-booking-system__loading">
            <Loader size={20} className="machine-booking-system__loading-spinner" />
            <span className="machine-booking-system__loading-text">Loading booking data...</span>
          </div>
        )}

        {/* Calendar Grid */}
        {!loading && (
          <div className="machine-booking-system__calendar">
            <div className="machine-booking-system__calendar-content">
              {/* Month Name Header */}
              <div className="machine-booking-system__month-header">
                {viewDays === 1 
                  ? currentDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                }
                {viewDays > 1 && (
                  <div className="machine-booking-system__month-header-subtitle">
                    {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
                    {(() => {
                      const endDate = new Date(currentDate);
                      endDate.setDate(currentDate.getDate() + viewDays - 1);
                      return endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    })()}
                  </div>
                )}
              </div>

              {/* Navigation Header */}
              <div className="machine-booking-system__navigation">
                <div className="machine-booking-system__navigation-group">
                  <Button
                    onClick={() => navigate('prevFast')}
                    title={`Previous ${viewDays === 1 ? 'day' : `${viewDays} days`}`}
                  >
                    &lt;&lt;
                  </Button>
                  <Button
                    onClick={() => navigate('prev')}
                    title="Previous day"
                  >
                    &lt;
                  </Button>
                </div>
                
                <div></div>
                
                <div className="machine-booking-system__navigation-group">
                  <Button
                    onClick={() => navigate('next')}
                    title="Next day"
                  >
                    &gt;
                  </Button>
                  <Button
                    onClick={() => navigate('nextFast')}
                    title={`Next ${viewDays === 1 ? 'day' : `${viewDays} days`}`}
                  >
                    &gt;&gt;
                  </Button>
                </div>
              </div>

              {/* Table */}
              <div className="machine-booking-system__table-container">
                <div className="machine-booking-system__table-container-scroll">
                  <table className="machine-booking-system__table">
                    <thead>
                      <tr>
                        <th className="machine-booking-system__table-header machine-booking-system__table-header--machine-id">
                          Machine ID
                        </th>
                        {dates.map((date, idx) => (
                          <th 
                            key={idx} 
                            className={`machine-booking-system__table-header machine-booking-system__table-header--date ${
                              isToday(date) ? 'today' : ''
                            } ${
                              isWeekend(date) ? 'weekend' : ''
                            }`}
                          >
                            <div className="machine-booking-system__table-header--date-day">
                              {date.toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className="machine-booking-system__table-header--date-number">
                              {viewDays === 1 
                                ? `${date.getDate()}`
                                : `${date.getDate()}`
                              }
                            </div>
                            {isToday(date) && (
                              <div className="machine-booking-system__table-header--date-today-label">Today</div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMachines.length === 0 ? (
                        <tr>
                          <td colSpan={dates.length + 1} className="machine-booking-system__table-cell machine-booking-system__table-cell--no-data">
                            {searchQuery || machineType || machineCategory ? 'No machines found matching your filters' : 'No machines available'}
                          </td>
                        </tr>
                      ) : (
                        filteredMachines.map((machine) => (
                          <tr key={machine}>
                            <td className="machine-booking-system__table-row-header">
                              {machine.replace('Machine_', '')}
                            </td>
                            {dates.map((date, idx) => {
                              const status = getCellStatus(machine, date);
                              const nextStatus = idx < dates.length - 1 ? getCellStatus(machine, dates[idx + 1]) : null;
                              
                              let cellStyle = {
                                borderRight: ''
                              };
                              
                              // Only add right border if this cell and next cell are not part of the same booking
                              if (idx < dates.length - 1) {
                                const shouldShowBorder = !status || !nextStatus || 
                                  status.id !== nextStatus.id || 
                                  status.status !== nextStatus.status;
                                
                                if (shouldShowBorder) {
                                  cellStyle.borderRight = '1px solid #e5e7eb';
                                }
                              }
                              
                              let cellContent = null;
                              let cellClass = 'machine-booking-system__table-cell';
                              
                              if (status) {
                                console.log('Cell status found:', status.status, 'for booking ID:', status.id); // Debug log
                                
                                // Apply background color directly via style for immediate effect
                                const backgroundColor = getStatusColor(status.status);
                                cellStyle.backgroundColor = backgroundColor;
                                cellStyle.color = 'white';
                                cellStyle.fontWeight = '500';
                                
                                console.log('Applied background color:', backgroundColor); // Debug log
                                
                                // Also add CSS classes for additional styling
                                cellClass += ' machine-booking-system__table-cell--booked';
                                if (status.status === 'accepted') {
                                  cellClass += ' system system-booking';
                                } else if (status.status === 'blocked') {
                                  cellClass += ' manual manual-booking';
                                } else if (status.status === 'cancelled') {
                                  cellClass += ' cancelled cancelled-booking';
                                } else if (status.status === 'change_of_date') {
                                  cellClass += ' rescheduled rescheduled-booking';
                                }
                                
                                if (status.isStart) {
                                  if (status.status === 'blocked') {
                                    cellContent = 'Manual';
                                  } else if (status.status === 'accepted' && status.quoteId) {
                                    cellContent = `Q#${status.quoteId}`;
                                  } else if (status.status === 'accepted') {
                                    cellContent = 'System';
                                  }
                                }
                              } else {
                                cellClass += ' machine-booking-system__table-cell--empty';
                              }
                              
                              return (
                                <td 
                                  key={idx} 
                                  className={cellClass}
                                  style={cellStyle}
                                  onClick={() => handleCellClick(machine, date)}
                                  title={status ? 
                                    (status.status === 'blocked' 
                                      ? 'Manual Booking (Click to cancel)' 
                                      : `System Booking${status.quoteId ? ` - Quote #${status.quoteId}` : ` #${status.id}`} (Cannot be cancelled)`) : 
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
              <div className="machine-booking-system__legend">
                <div className="machine-booking-system__legend-item">
                  <div className="machine-booking-system__legend-color machine-booking-system__legend-color--system"></div>
                  <span className="machine-booking-system__legend-label">System Booking</span>
                </div>
                <div className="machine-booking-system__legend-item">
                  <div className="machine-booking-system__legend-color machine-booking-system__legend-color--manual"></div>
                  <span className="machine-booking-system__legend-label">Manual Booking</span>
                </div>
                <div className="machine-booking-system__legend-item">
                  <div className="machine-booking-system__legend-color machine-booking-system__legend-color--cancelled"></div>
                  <span className="machine-booking-system__legend-label">Cancelled</span>
                </div>
                <div className="machine-booking-system__legend-item">
                  <div className="machine-booking-system__legend-color machine-booking-system__legend-color--rescheduled"></div>
                  <span className="machine-booking-system__legend-label">Rescheduled</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <Button
        className="machine-booking-system__fab"
        type="primary"
        shape="circle"
        icon={<Plus size={20} />}
        onClick={() => {
          setSelectedSlot(null);
          setBookingModal(true);
        }}
        title="Create new booking"
      />

      {/* Booking Modal */}
      {bookingModal && (
        <div className="machine-booking-system__modal">
          <div className="machine-booking-system__modal-content">
            <div className="machine-booking-system__modal-header machine-booking-system__modal-header--create">
              <h2 className="machine-booking-system__modal-header-title">Create Manual Booking</h2>
              <p className="machine-booking-system__modal-header-subtitle">
                Block machine slot manually
              </p>
            </div>
            
            <div className="machine-booking-system__modal-body">
              {selectedSlot && (
                <div className="machine-booking-system__modal-info-box">
                  <p className="machine-booking-system__modal-info-box-title">
                    <strong>Machine ID:</strong> {selectedSlot.machineId}
                  </p>
                  <p className="machine-booking-system__modal-info-box-text">
                    <strong>Selected Date:</strong> {selectedSlot.date.toLocaleDateString()}
                  </p>
                </div>
              )}
              
              <div className="machine-booking-system__modal-form">
                {!selectedSlot && (
                  <div className="machine-booking-system__modal-form-group">
                    <label className="machine-booking-system__modal-form-group-label">
                      Machine ID
                    </label>
                    <select
                      className="machine-booking-system__modal-form-group-select"
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
                
                <div className="machine-booking-system__modal-form-group">
                  <label className="machine-booking-system__modal-form-group-label">
                    Start Date *
                  </label>
                  <input
                    className="machine-booking-system__modal-form-group-input"
                    type="date"
                    value={bookingForm.plannedstartdatetime ? bookingForm.plannedstartdatetime.split(' ')[0] : ''}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      if (dateValue) {
                        setBookingForm({...bookingForm, plannedstartdatetime: `${dateValue} 06:00:00`});
                      } else {
                        setBookingForm({...bookingForm, plannedstartdatetime: ''});
                      }
                    }}
                  />
                </div>
                
                <div className="machine-booking-system__modal-form-group">
                  <label className="machine-booking-system__modal-form-group-label">
                    End Date *
                  </label>
                  <input
                    className="machine-booking-system__modal-form-group-input"
                    type="date"
                    value={bookingForm.plannedenddatetime ? bookingForm.plannedenddatetime.split(' ')[0] : ''}
                    onChange={(e) => {
                      const dateValue = e.target.value;
                      if (dateValue) {
                        setBookingForm({...bookingForm, plannedenddatetime: `${dateValue} 18:00:00`});
                      } else {
                        setBookingForm({...bookingForm, plannedenddatetime: ''});
                      }
                    }}
                  />
                </div>
                
                <div className="machine-booking-system__modal-form-group">
                  <label className="machine-booking-system__modal-form-group-label">
                    Notes
                  </label>
                  <textarea
                    className="machine-booking-system__modal-form-group-textarea"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                    placeholder="Add any notes for this booking..."
                    rows={2}
                  />
                </div>
                
                <div className="machine-booking-system__modal-form-actions">
                  <Button
                    className="machine-booking-system__modal-form-actions-button machine-booking-system__modal-form-actions-button--primary"
                    type="primary"
                    onClick={handleBookingSubmit}
                    disabled={submitting || !bookingForm.machineid || !bookingForm.plannedstartdatetime || !bookingForm.plannedenddatetime}
                    loading={submitting}
                  >
                    {submitting ? 'Blocking...' : 'Block'}
                  </Button>
                  <Button
                    className="machine-booking-system__modal-form-actions-button machine-booking-system__modal-form-actions-button--secondary"
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
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {cancelModal && selectedBooking && (
        <div className="machine-booking-system__modal">
          <div className="machine-booking-system__modal-content machine-booking-system__modal-content--cancel">
            <div className="machine-booking-system__modal-header machine-booking-system__modal-header--cancel">
              <h2 className="machine-booking-system__modal-header-title machine-booking-system__modal-header-title--cancel">
                <Trash2 size={20} />
                Cancel Booking
              </h2>
              <p className="machine-booking-system__modal-header-subtitle machine-booking-system__modal-header-subtitle--cancel">
                Remove this booking from the calendar
              </p>
            </div>
            
            <div className="machine-booking-system__modal-body machine-booking-system__modal-body--cancel">
              <div className="machine-booking-system__modal-info-box machine-booking-system__modal-info-box--cancel">
                <p className="machine-booking-system__modal-info-box-title machine-booking-system__modal-info-box-title--cancel">
                  <strong>Booking ID:</strong> #{selectedBooking.id}
                </p>
                <p className="machine-booking-system__modal-info-box-text machine-booking-system__modal-info-box-text--cancel">
                  <strong>Machine:</strong> {selectedBooking.id ? machines.find(m => m.includes(''))?.replace('Machine_', '') || 'Unknown' : 'Unknown'}
                </p>
                <p className="machine-booking-system__modal-info-box-text machine-booking-system__modal-info-box-text--cancel">
                  <strong>Duration:</strong> {selectedBooking.start?.toLocaleDateString()} - {selectedBooking.end?.toLocaleDateString()}
                </p>
                <p className="machine-booking-system__modal-info-box-text machine-booking-system__modal-info-box-text--cancel">
                  <strong>Type:</strong> {selectedBooking.status === 'blocked' ? 'Manual Booking' : 'System Booking'}
                </p>
              </div>
              
              <div className="machine-booking-system__modal-form machine-booking-system__modal-form--cancel">
                <div className="machine-booking-system__modal-form-group">
                  <label className="machine-booking-system__modal-form-group-label machine-booking-system__modal-form-group-label--cancel">
                    Cancellation Reason *
                  </label>
                  <textarea
                    className="machine-booking-system__modal-form-group-textarea machine-booking-system__modal-form-group-textarea--cancel"
                    value={cancelForm.reason}
                    onChange={(e) => setCancelForm({...cancelForm, reason: e.target.value})}
                    placeholder="Please provide a reason for cancelling this booking..."
                    rows={4}
                  />
                </div>
                
                <div className="machine-booking-system__modal-form-actions machine-booking-system__modal-form-actions--cancel">
                  <Button
                    type="primary"
                    danger
                    onClick={handleBookingCancel}
                    disabled={submitting || !cancelForm.reason.trim()}
                    loading={submitting}
                    icon={<Trash2 size={16} />}
                    style={{ flex: 1 }}
                  >
                    {submitting ? 'Cancelling...' : 'Cancel Booking'}
                  </Button>
                  <Button
                    onClick={() => {
                      setCancelModal(false);
                      setSelectedBooking(null);
                      setCancelForm({ reason: '' });
                    }}
                    style={{ flex: 1 }}
                  >
                    Keep Booking
                  </Button>
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