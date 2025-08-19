import React, { useState, useEffect } from 'react';
import Invoice from './invoice_component';
import { GET_COMPANY_DETAILS_BY_ID } from '../../api/apiUrls';
import axios from 'axios';

// Function to generate a unique invoice number
const generateUniqueInvoiceNumber = () => {
    // In a real-world application, this number should come from a backend database
    // to ensure true uniqueness across all users and sessions.
    // This is a simple client-side example for demonstration.
    const uniqueId = Date.now(); 
    return `rtm-inv-${String(uniqueId).slice(-6)}`;
};

const InvoicePage = () => {
  const [companyInfo, setCompanyInfo] = useState({});
  const [customerInfo, setCustomerInfo] = useState({});
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: generateUniqueInvoiceNumber(),
    date: new Date().toISOString().slice(0, 10),
    paymentTerms: '100% advanced payment',
    orderNumber: '',
  });
  const [items, setItems] = useState([
    { description: '', partNumber: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    gst: 0,
    grandTotal: 0,
  });

   useEffect(() => {
    // We create a single async function to fetch all the data
    const fetchInvoiceData = async () => {
      try {
        // Fetch company details
        const token = localStorage.getItem('authToken');
        axios.defaults.headers.common['authorization'] = 'Bearer ' + token;
        const companyResponse = await axios.get(GET_COMPANY_DETAILS_BY_ID, {
          params: { companyId: 1040 }
        });
        setCompanyInfo(companyResponse.data);

        // You would perform a similar call for customer data
        const customerResponse = await axios.get(GET_COMPANY_DETAILS_BY_ID);
        setCustomerInfo(customerResponse.data);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchInvoiceData();
  }, []);

  useEffect(() => {
    const newSubtotal = items.reduce(
      (acc, item) => acc + (item.quantity * item.unitPrice),
      0
    );
    const newGst = newSubtotal * 0.18;
    const newGrandTotal = newSubtotal + newGst;
    setTotals({
      subtotal: newSubtotal,
      gst: newGst,
      grandTotal: newGrandTotal,
    });
  }, [items]);

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...items];
    newItems[index][name] = value;
    newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems(prevItems => [
      ...prevItems,
      { description: '', partNumber: '', quantity: 1, unitPrice: 0, total: 0 }
    ]);
  };

  const removeItemRow = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  return (
    <div className="invoice-page">
      <h1>Invoice Generator</h1>
      <Invoice
        companyInfo={companyInfo}
        customerInfo={customerInfo}
        invoiceDetails={invoiceDetails}
        items={items}
        totals={totals}
        handleInvoiceChange={handleInvoiceChange}
        handleItemChange={handleItemChange}
        addItemRow={addItemRow}
        removeItemRow={removeItemRow}
      />
    </div>
  );
};

export default InvoicePage;