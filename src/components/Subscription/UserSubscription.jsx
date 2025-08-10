import React, { useState, useEffect } from 'react';
import './UserSubscription.scss'; // Assuming you have the CSS from before

const CustomerSubscriptionPage = () => {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/plans.json')
      .then(response => response.json())
      .then(data => {
        setTableData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching plans:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading subscription plans...</p>;
  }

  const planHeaders = tableData.length > 0 ? Object.keys(tableData[0]).filter(key => key !== 'feature_name') : [];

  return (
    <div className="subscription-container">
      <div className="plan-grid">
        {/* Top-left empty cell */}
        <div className="corner-cell"></div>

        {/* Plan Headers */}
        {planHeaders.map(header => (
          <div key={header} className={`plan-header ${header}`}>
            <h3>{header.charAt(0).toUpperCase() + header.slice(1)}</h3>
            <p>{tableData[0][header]}</p>
          </div>
        ))}

        {/* Feature and Annual Fees Rows */}
        {tableData.slice(1).map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            <div className="feature-label">{row.feature_name}</div>
            {planHeaders.map(planKey => (
              <div key={planKey} className="feature-cell">
                {row[planKey]}
              </div>
            ))}
          </React.Fragment>
        ))}

        {/* Button Row */}
        <div className="button-label-cell"></div>
        {planHeaders.map(header => (
          <div key={`button-${header}`} className="button-cell">
            <button className="cta-button">Select</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerSubscriptionPage;