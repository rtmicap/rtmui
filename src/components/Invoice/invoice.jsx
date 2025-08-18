import React, { useState, useEffect } from 'react';
import Invoice from './invoice_component'; // Adjust the path as needed

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
    const fetchCompanyData = () => ({
      name: 'Your Company Name',
      address: '123 Business Lane, City, State, ZIP',
      gstin: '27ABCDE1234F1Z5',
      email: 'contact@yourcompany.com',
      phone: '+91 9876543210',
    });

    const fetchCustomerData = () => ({
      name: 'Customer Name',
      address: '456 Customer St, New Town, State, ZIP',
      phone: '+91 1234567890',
      email: 'customer@email.com',
      gstin: '27FGHIJ5678K2Z6',
    });

    setCompanyInfo(fetchCompanyData());
    setCustomerInfo(fetchCustomerData());
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