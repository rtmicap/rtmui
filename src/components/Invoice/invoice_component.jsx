import PropTypes from 'prop-types';
import './Invoice.scss';

const Invoice = ({
  companyInfo,
  customerInfo,
  invoiceDetails,
  items,
  totals,
  handleInvoiceChange,
  handleItemChange,
  addItemRow,
  removeItemRow
}) => {
  const paymentTerms = [
    '100% advanced payment',
    'On job done',
    'Net 15',
    'Net 30'
  ];

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <div className="from-section">
          <h2>From:</h2>
          <p>{companyInfo.name}</p>
          <p>{companyInfo.address}</p>
          <p>GSTIN: {companyInfo.gstin}</p>
          <p>Email: {companyInfo.email}</p>
        </div>
        <div className="invoice-details">
          <h2>Invoice Details:</h2>
          <div className="detail-row">
            <label>Invoice #:</label>
            <input
              type="text"
              name="invoiceNumber"
              value={invoiceDetails.invoiceNumber}
              onChange={handleInvoiceChange}
            />
          </div>
          <div className="detail-row">
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={invoiceDetails.date}
              onChange={handleInvoiceChange}
            />
          </div>
          <div className="detail-row">
            <label>Payment Terms:</label>
            <select
              name="paymentTerms"
              value={invoiceDetails.paymentTerms}
              onChange={handleInvoiceChange}
            >
              {paymentTerms.map((term, index) => (
                <option key={index} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </div>
          <div className="detail-row">
            <label>Order #:</label>
            <input
              type="text"
              name="orderNumber"
              value={invoiceDetails.orderNumber}
              onChange={handleInvoiceChange}
            />
          </div>
        </div>
      </div>

      <div className="bill-to-section">
        <h2>Bill To:</h2>
        <p>{customerInfo.name}</p>
        <p>{customerInfo.address}</p>
        <p>Email: {customerInfo.email}</p>
        <p>GSTIN: {customerInfo.gstin}</p>
      </div>


<div className="responsive-table-wrapper">
      <table className="items-table">
        <thead>
          <tr>
            <th>Item/Service Description</th>
            <th>Customer Part No.</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total Amount (Before GST)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  name="description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, e)}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="partNumber"
                  value={item.partNumber}
                  onChange={(e) => handleItemChange(index, e)}
                />
              </td>
              <td>
                <input
                  type="number"
                  name="quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, e)}
                />
              </td>
              <td>
                <input
                  type="number"
                  name="unitPrice"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, e)}
                />
              </td>
              <td>₹ {item.total.toFixed(2)}</td>
              <td>
                {items.length > 1 && (
                  <button onClick={() => removeItemRow(index)}>Remove</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <button className="add-row-btn" onClick={addItemRow}>
        + Add Item/Service
      </button>

      <div className="invoice-totals">
        <div className="total-row">
          <span>Subtotal:</span>
          <span>₹ {totals.subtotal.toFixed(2)}</span>
        </div>
        <div className="total-row">
          <span>GST (18%):</span>
          <span>₹ {totals.gst.toFixed(2)}</span>
        </div>
        <div className="total-row total-amount">
          <span>Grand Total:</span>
          <span>₹ {totals.grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

Invoice.propTypes = {
  companyInfo: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    gstin: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
  }).isRequired,
  customerInfo: PropTypes.shape({
    name: PropTypes.string,
    address: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    gstin: PropTypes.string,
  }).isRequired,
  invoiceDetails: PropTypes.shape({
    invoiceNumber: PropTypes.string,
    date: PropTypes.string,
    paymentTerms: PropTypes.string,
    orderNumber: PropTypes.string,
  }).isRequired,
  items: PropTypes.arrayOf(PropTypes.shape({
    description: PropTypes.string,
    partNumber: PropTypes.string,
    quantity: PropTypes.number,
    unitPrice: PropTypes.number,
    total: PropTypes.number,
  })).isRequired,
  totals: PropTypes.shape({
    subtotal: PropTypes.number,
    gst: PropTypes.number,
    grandTotal: PropTypes.number,
  }).isRequired,
  handleInvoiceChange: PropTypes.func.isRequired,
  handleItemChange: PropTypes.func.isRequired,
  addItemRow: PropTypes.func.isRequired,
  removeItemRow: PropTypes.func.isRequired,
};

export default Invoice;