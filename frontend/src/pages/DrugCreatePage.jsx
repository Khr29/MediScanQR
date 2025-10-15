import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createDrug } from '../services/api'; // We'll add this to api.js

const DrugCreatePage = () => {
    const [name, setName] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Basic validation
        if (!name || !manufacturer || !description || !price) {
            setError('Please fill in all fields.');
            setLoading(false);
            return;
        }

        try {
            const drugData = { 
                name, 
                manufacturer, 
                description, 
                price: parseFloat(price) 
            };
            
            await createDrug(drugData); 
            setSuccess(`Successfully added: ${name}`);
            
            // Clear form after success
            setName('');
            setManufacturer('');
            setDescription('');
            setPrice('');
            
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add drug. Check if you are logged in as a Doctor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Add New Drug to Inventory</h1>
            <form onSubmit={handleSubmit}>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message" style={{color: 'var(--color-success)', fontWeight: 'bold'}}>{success}</p>}

                <div>
                    <label>Drug Name:</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                    <label>Manufacturer:</label>
                    <input type="text" value={manufacturer} onChange={(e) => setManufacturer(e.target.value)} required />
                </div>
                <div>
                    <label>Price ($):</label>
                    <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div>
                    <label>Description/Usage:</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
                </div>
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Drug'}
                </button>
            </form>
        </div>
    );
};

export default DrugCreatePage;