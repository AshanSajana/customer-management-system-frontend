import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [customers, setCustomers] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  
  const [formData, setFormData] = useState({ 
    name: '', dob: '', nic: '', mobiles: [{ mobileNumber: '' }],
    addressLine1: '', addressLine2: '', countryId: '', cityId: '' 
  });
  
  const [editingId, setEditingId] = useState(null);

  const [showAddCountry, setShowAddCountry] = useState(false);
  const [newCountryName, setNewCountryName] = useState('');
  
  const [showAddCity, setShowAddCity] = useState(false);
  const [newCityName, setNewCityName] = useState('');

  // --- NEW: State for the Excel File Upload ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchCountries();
  }, []);

  const fetchCustomers = () => {
    axios.get('http://localhost:8080/api/customers')
      .then(response => setCustomers(response.data))
      .catch(error => console.error("Error fetching data: ", error));
  };

  const fetchCountries = () => {
    axios.get('http://localhost:8080/api/master-data/countries')
      .then(response => setCountries(response.data))
      .catch(error => console.error("Error fetching countries: ", error));
  };

  const handleCountryChange = (event) => {
    const countryId = event.target.value;
    setFormData({ ...formData, countryId: countryId, cityId: '' }); 
    
    if (countryId) {
      axios.get(`http://localhost:8080/api/master-data/cities/${countryId}`)
        .then(response => setCities(response.data))
        .catch(error => console.error("Error fetching cities: ", error));
    } else {
      setCities([]);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleMobileChange = (index, value) => {
    const newMobiles = [...formData.mobiles];
    newMobiles[index].mobileNumber = value;
    setFormData({ ...formData, mobiles: newMobiles });
  };

  const addMobileField = () => {
    setFormData({ ...formData, mobiles: [...formData.mobiles, { mobileNumber: '' }] });
  };

  const removeMobileField = (index) => {
    const newMobiles = formData.mobiles.filter((_, i) => i !== index);
    setFormData({ ...formData, mobiles: newMobiles });
  };

  const resetForm = () => {
    setFormData({ name: '', dob: '', nic: '', mobiles: [{ mobileNumber: '' }], addressLine1: '', addressLine2: '', countryId: '', cityId: '' });
    setCities([]);
    setEditingId(null);
    setShowAddCountry(false);
    setShowAddCity(false);
  };

  const handleEditClick = (customer) => {
    const customerMobiles = customer.mobiles && customer.mobiles.length > 0 ? customer.mobiles : [{ mobileNumber: '' }];
    const address = customer.addresses && customer.addresses.length > 0 ? customer.addresses[0] : null;

    setFormData({ 
      name: customer.name, 
      dob: customer.dob, 
      nic: customer.nic,
      mobiles: customerMobiles,
      addressLine1: address ? address.addressLine1 : '',
      addressLine2: address ? address.addressLine2 : '',
      countryId: address?.city?.country?.id ? String(address.city.country.id) : '',
      cityId: address?.city?.id ? String(address.city.id) : ''
    });
    
    setEditingId(customer.id);

    if (address?.city?.country?.id) {
      axios.get(`http://localhost:8080/api/master-data/cities/${address.city.country.id}`)
        .then(response => setCities(response.data))
        .catch(error => console.error("Error fetching cities: ", error));
    }
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      axios.delete(`http://localhost:8080/api/customers/${id}`)
        .then(() => {
          setCustomers(customers.filter(cust => cust.id !== id));
          if (editingId === id) resetForm();
        })
        .catch(error => console.error("Error deleting customer: ", error));
    }
  };

  const saveNewCountry = () => {
    if (!newCountryName) return;
    axios.post('http://localhost:8080/api/master-data/countries', { name: newCountryName })
      .then(response => {
        setCountries([...countries, response.data]);
        setFormData({ ...formData, countryId: String(response.data.id), cityId: '' });
        setCities([]); 
        setNewCountryName('');
        setShowAddCountry(false); 
      })
      .catch(error => console.error("Error saving new country: ", error));
  };

  const saveNewCity = () => {
    if (!newCityName || !formData.countryId) return;
    const payload = { name: newCityName, country: { id: formData.countryId } };
    
    axios.post('http://localhost:8080/api/master-data/cities', payload)
      .then(response => {
        setCities([...cities, response.data]);
        setFormData({ ...formData, cityId: String(response.data.id) });
        setNewCityName('');
        setShowAddCity(false); 
      })
      .catch(error => console.error("Error saving new city: ", error));
  };

  
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  
  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("Please select an Excel file first!");
      return;
    }

    setIsUploading(true);
    
    
    const fileData = new FormData();
    fileData.append("file", selectedFile);

    try {
      
      await axios.post('http://localhost:8080/api/customers/upload', fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert("File uploaded and processed successfully!");
      setSelectedFile(null); 
      
      
      document.getElementById("excel-upload-input").value = ""; 
      
      fetchCustomers(); 

    } catch (error) {
      console.error("Error uploading file: ", error);
      alert("Failed to upload file. Check the console.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault(); 
    
    const payload = {
      name: formData.name, dob: formData.dob, nic: formData.nic,
      mobiles: formData.mobiles.filter(m => m.mobileNumber !== ''), 
      addresses: []
    };

    if (formData.addressLine1 || formData.addressLine2 || formData.cityId) {
      const newAddress = { addressLine1: formData.addressLine1, addressLine2: formData.addressLine2 };
      if (formData.cityId) { newAddress.city = { id: formData.cityId }; }
      payload.addresses.push(newAddress);
    }

    if (editingId) {
      axios.put(`http://localhost:8080/api/customers/${editingId}`, payload)
        .then(() => { fetchCustomers(); resetForm(); })
        .catch(error => console.error("Error updating: ", error));
    } else {
      axios.post('http://localhost:8080/api/customers', payload)
        .then(() => { fetchCustomers(); resetForm(); })
        .catch(error => console.error("Error saving: ", error));
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Customer Management System</h1>

      {/* --- NEW: Bulk Upload Panel --- */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #2196F3', backgroundColor: '#e3f2fd' }}>
        <h3 style={{ marginTop: '0' }}>Bulk Upload via Excel</h3>
        <p style={{ fontSize: '14px', color: '#555' }}>Upload an Excel file (.xlsx) with columns: <strong>Name, DOB, NIC,Mobiles,Addresses</strong>.</p>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="file" 
            id="excel-upload-input"
            accept=".xlsx, .xls" 
            onChange={handleFileChange} 
          />
          <button 
            onClick={handleFileUpload} 
            disabled={!selectedFile || isUploading}
            style={{ 
              padding: '8px 15px', 
              backgroundColor: isUploading ? '#ccc' : '#2196F3', 
              color: 'white', 
              border: 'none', 
              cursor: isUploading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isUploading ? "Processing File..." : "Upload & Save"}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ccc', backgroundColor: editingId ? '#fff3cd' : '#f9f9f9' }}>
        <h3>{editingId ? "Update Customer" : "Add New Customer"}</h3>
        <form onSubmit={handleSubmit}>
          
          <div style={{ marginBottom: '15px' }}>
            <label>Name: </label><input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            <label style={{ marginLeft: '10px' }}>DOB: </label><input type="date" name="dob" value={formData.dob} onChange={handleInputChange} required />
            <label style={{ marginLeft: '10px' }}>NIC: </label><input type="text" name="nic" value={formData.nic} onChange={handleInputChange} required />
          </div>

          <div style={{ marginBottom: '15px', padding: '10px', border: '1px dashed #aaa' }}>
            <strong>Mobile Numbers:</strong><br/>
            {formData.mobiles.map((mobile, index) => (
              <div key={index} style={{ marginTop: '5px' }}>
                <input type="text" value={mobile.mobileNumber} onChange={(e) => handleMobileChange(index, e.target.value)} />
                {formData.mobiles.length > 1 && <button type="button" onClick={() => removeMobileField(index)} style={{ marginLeft: '5px', color: 'red' }}>X</button>}
              </div>
            ))}
            <button type="button" onClick={addMobileField} style={{ marginTop: '5px' }}>+ Add Number</button>
          </div>

          <div style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ccc' }}>
            <strong>Primary Address:</strong><br/>
            <div style={{ marginTop: '5px' }}>
              <input type="text" name="addressLine1" placeholder="Address Line 1" value={formData.addressLine1} onChange={handleInputChange} style={{ width: '200px' }} />
              <input type="text" name="addressLine2" placeholder="Address Line 2" value={formData.addressLine2} onChange={handleInputChange} style={{ width: '200px', marginLeft: '10px' }} />
            </div>
            
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {showAddCountry ? (
                <span>
                  <input type="text" placeholder="New Country Name" value={newCountryName} onChange={(e) => setNewCountryName(e.target.value)} />
                  <button type="button" onClick={saveNewCountry} style={{ marginLeft: '5px' }}>Save</button>
                  <button type="button" onClick={() => setShowAddCountry(false)} style={{ marginLeft: '5px' }}>Cancel</button>
                </span>
              ) : (
                <span>
                  <select value={formData.countryId} onChange={handleCountryChange}>
                    <option value="">-- Select Country --</option>
                    {countries.map(country => (<option key={country.id} value={country.id}>{country.name}</option>))}
                  </select>
                  <button type="button" onClick={() => setShowAddCountry(true)} style={{ marginLeft: '5px' }}>+</button>
                </span>
              )}

              {showAddCity ? (
                <span>
                  <input type="text" placeholder="New City Name" value={newCityName} onChange={(e) => setNewCityName(e.target.value)} />
                  <button type="button" onClick={saveNewCity} style={{ marginLeft: '5px' }}>Save</button>
                  <button type="button" onClick={() => setShowAddCity(false)} style={{ marginLeft: '5px' }}>Cancel</button>
                </span>
              ) : (
                <span>
                  <select name="cityId" value={formData.cityId} onChange={handleInputChange} disabled={!formData.countryId}>
                    <option value="">-- Select City --</option>
                    {cities.map(city => (<option key={city.id} value={city.id}>{city.name}</option>))}
                  </select>
                  <button type="button" onClick={() => setShowAddCity(true)} disabled={!formData.countryId} style={{ marginLeft: '5px' }}>+</button>
                </span>
              )}
            </div>
          </div>
          
          <button type="submit" style={{ padding: '8px 15px', backgroundColor: editingId ? '#ffc107' : '#4CAF50', color: editingId ? 'black' : 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            {editingId ? "Update Customer" : "Save Customer"}
          </button>
          {editingId && <button type="button" onClick={resetForm} style={{ marginLeft: '10px', padding: '8px 15px' }}>Cancel</button>}
        </form>
      </div>

      <h3>Customer Directory</h3>
      <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead style={{ backgroundColor: '#e2e2e2' }}>
          <tr>
            <th>ID</th><th>Name</th><th>DOB</th><th>NIC</th><th>Mobiles</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr><td colSpan="7" style={{ textAlign: 'center' }}>No customers found.</td></tr>
          ) : (
            customers.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td><td>{c.name}</td><td>{c.dob}</td><td>{c.nic}</td>
                <td>{c.mobiles && c.mobiles.length > 0 ? c.mobiles.map(m => m.mobileNumber).join(', ') : '-'}</td>
                {/* <td>
                  {c.addresses && c.addresses.length > 0 
                    ? [
                        c.addresses[0].addressLine1, 
                        c.addresses[0].addressLine2, 
                        c.addresses[0].city?.name, 
                        c.addresses[0].city?.country?.name
                      ].filter(Boolean).join(', ') 
                    : '-'}
                </td> */}
                <td>
                  <button onClick={() => handleEditClick(c)} style={{ padding: '5px 10px', cursor: 'pointer', marginRight: '5px' }}>Edit</button>
                  <button onClick={() => handleDeleteClick(c.id)} style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none' }}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;