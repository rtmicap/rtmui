import React, { useState, useEffect } from 'react';
import Invoice from './invoice_component';
import { GET_COMPANY_DETAILS_BY_ID } from '../../api/apiUrls';
import axios from '../../api/axios';

// Function to generate a unique invoice number
const generateUniqueInvoiceNumber = () => {
    // In a real-world application, this number should come from a backend database
    // to ensure true uniqueness across all users and sessions.
    // This is a simple client-side example for demonstration.
    const uniqueId = Date.now(); 
    return `rtm-inv-${String(uniqueId).slice(-6)}`;
};

const InvoicePage = () => {
  const [loading, setLoading] = useState(false);
  const [companyInfo, setCompanyInfo] = useState({});
  const [customerInfo, setCustomerInfo] = useState({});
  const [orderNumber, setOrderNumber] = useState('1111');
  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceNumber: generateUniqueInvoiceNumber(),
    date: new Date().toISOString().slice(0, 10),
    paymentTerms: '100% advanced payment',
    orderNumber: orderNumber,
  });
  const [items, setItems] = useState([
  { description: '', partNumber: '', quantity: 1, unitPrice: 0, total: 0 }
]);
const [taxes, setTaxes] = useState([
  { name: 'GST', rate: 18, amount: 0 }
]);
const [totals, setTotals] = useState({
  subtotal: 0,
  grandTotal: 0,
});

  const fetchInvoicerData = async () => {
      try {
        setLoading(true);
        // Fetch company details
        const token = localStorage.getItem('authToken');
        axios.defaults.headers.common['authorization'] = 'Bearer ' + token;
        const companyResponse = await axios.get(GET_COMPANY_DETAILS_BY_ID, {
          params: { companyId: 1040 }
        });
        const resData = companyResponse.data.data;
        const officeAddress = resData.officeAddr + ', ' + resData.officeArea + ', ' + resData.officeCity + ', ' + resData.officeCountry + ', ' + resData.officeState + ' - ' + resData.officePin;
        const factoryAddress = resData.factoryAddr + ', ' + resData.factoryArea + ', ' + resData.factoryCity + ', ' + resData.factoryCountry + ', ' + resData.factoryState + ' - ' + resData.factoryPin;
        const invoicerInfo = {
          name: resData.companyName,
          address: factoryAddress,
          gstin: resData.GSTIN,
          email: resData.factoryEmail
        };
        setCompanyInfo(invoicerInfo);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

  const fetchInvoiceeData = async () => {
      try {
        setLoading(true);
        // Fetch company details
        const token = localStorage.getItem('authToken');
        axios.defaults.headers.common['authorization'] = 'Bearer ' + token;
        const companyResponse = await axios.get(GET_COMPANY_DETAILS_BY_ID, {
          params: { companyId: 1023 }
        });
        const resData = companyResponse.data.data;
        const officeAddress = resData.officeAddr + ', ' + resData.officeArea + ', ' + resData.officeCity + ', ' + resData.officeCountry + ', ' + resData.officeState + ' - ' + resData.officePin;
        const factoryAddress = resData.factoryAddr + ', ' + resData.factoryArea + ', ' + resData.factoryCity + ', ' + resData.factoryCountry + ', ' + resData.factoryState + ' - ' + resData.factoryPin;
        const invoiceeInfo = {
          name: resData.companyName,
          address: factoryAddress,
          gstin: resData.GSTIN,
          email: resData.factoryEmail
        };
        setCustomerInfo(invoiceeInfo);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };


   useEffect(() => {
    // We create a single async function to fetch all the data
    
    fetchInvoicerData();
    fetchInvoiceeData();
  }, []);

useEffect(() => {
  const newSubtotal = items.reduce(
    (acc, item) => acc + (item.quantity * item.unitPrice),
    0
  );
  
  let newGrandTotal = newSubtotal;

  const newTaxes = taxes.map(tax => {
    const taxAmount = (newSubtotal * tax.rate) / 100;
    newGrandTotal += taxAmount;
    return { ...tax, amount: taxAmount };
  });

  setTaxes(newTaxes);
  setTotals({
    subtotal: newSubtotal,
    grandTotal: newGrandTotal,
  });
}, [items, taxes.map(t => t.rate).join(',')]);

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

  const handleTaxChange = (index, e) => {
  const { name, value } = e.target;
  const newTaxes = [...taxes];
  newTaxes[index][name] = value;
  setTaxes(newTaxes);
};

const addTaxField = () => {
  setTaxes(prevTaxes => [...prevTaxes, { name: '', rate: 0, amount: 0 }]);
};

const removeTaxField = (index) => {
  const newTaxes = [...taxes];
  newTaxes.splice(index, 1);
  setTaxes(newTaxes);
};

  return (
    <div className="invoice-page">
      <h1>Invoice Generator</h1>
      <Invoice
  companyInfo={companyInfo}
  customerInfo={customerInfo}
  invoiceDetails={invoiceDetails}
  items={items}
  taxes={taxes}
  totals={totals}
  handleInvoiceChange={handleInvoiceChange}
  handleItemChange={handleItemChange}
  handleTaxChange={handleTaxChange}
  addItemRow={addItemRow}
  addTaxField={addTaxField}
  removeItemRow={removeItemRow}
  removeTaxField={removeTaxField}
/>
    </div>
  );
};

export default InvoicePage;