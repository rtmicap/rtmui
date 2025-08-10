import { useState, useEffect } from 'react';
import './subscription.scss'; // Make sure to import the CSS file

const AdminSubscriptionEditor = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/plans.json')
      .then(response => response.json())
      .then(data => {
        setPlans(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching plans:', error);
        setLoading(false);
      });
  }, []);

  const handlePlanChange = (planIndex, field, value) => {
    const newPlans = [...plans];
    newPlans[planIndex][field] = value;
    setPlans(newPlans);
  };

  const handleFeatureChange = (planIndex, featureIndex, field, value) => {
    const newPlans = [...plans];
    newPlans[planIndex].features[featureIndex][field] = value;
    setPlans(newPlans);
  };

  const addFeature = (planIndex) => {
    const newPlans = [...plans];
    newPlans[planIndex].features.push({ name: '', available: '' });
    setPlans(newPlans);
  };

  const removeFeature = (planIndex, featureIndex) => {
    const newPlans = [...plans];
    newPlans[planIndex].features.splice(featureIndex, 1);
    setPlans(newPlans);
  };

  const handlePublish = () => {
    console.log('Publishing new plans:', plans);
    alert('Content has been published!');
    // Real-world API call here:
    // axios.post('/api/publish-plans', plans);
  };

  if (loading) {
    return <p>Loading editor...</p>;
  }

  return (
    <div className="admin-container">
      <h1>Subscription Plan Editor</h1>
      {plans.map((plan, planIndex) => (
        <div key={plan.id} className="plan-editor">
          <h3>Plan: {plan.name}</h3>
          <div>
            <label>Plan Name:</label>
            <input
              type="text"
              value={plan.name}
              onChange={(e) => handlePlanChange(planIndex, 'name', e.target.value)}
            />
          </div>
          <div>
            <label>Price:</label>
            <input
              type="text"
              value={plan.annual_subscription_fees}
              onChange={(e) => handlePlanChange(planIndex, 'annual_subscription_fees', e.target.value)}
            />
          </div>
          <div>
            <label>Plan Description:</label>
            <input
              type="text"
              value={plan.description}
              onChange={(e) => handlePlanChange(planIndex, 'description', e.target.value)}
            />
          </div>
          
          <h4>Features:</h4>
          {plan.features.map((feature, featureIndex) => (
            <div key={featureIndex} className="feature-editor">
              <label>Feature Name:</label>
              <input
                type="text"
                value={feature.name}
                onChange={(e) => handleFeatureChange(planIndex, featureIndex, 'name', e.target.value)}
                placeholder="e.g., Suitability Machine registration"
              />
              <label>Availability:</label>
              <input
                type="text"
                value={feature.available}
                onChange={(e) => handleFeatureChange(planIndex, featureIndex, 'available', e.target.value)}
                placeholder="e.g., 5, Unlimited, Yes"
              />
              <button onClick={() => removeFeature(planIndex, featureIndex)}>Remove</button>
            </div>
          ))}
          <button onClick={() => addFeature(planIndex)} className="add-feature-button">Add Feature</button>
        </div>
      ))}
      <button onClick={handlePublish} className="publish-button">Publish All Plans</button>
    </div>
  );
};

export default AdminSubscriptionEditor;