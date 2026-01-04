import React from 'react';
import { db, auth } from './firebase';
import { doc, updateDoc } from 'firebase/firestore';

const PlansPage = ({ userProfile, setUserProfile }) => {

    const selectPlan = async (planName, price, credits) => {
        if (!userProfile) return;

        try {
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
                plan: planName,
                credits: (userProfile.credits || 0) + credits
            });
            setUserProfile({
                ...userProfile,
                plan: planName,
                credits: (userProfile.credits || 0) + credits
            });
            alert(`Selected ${planName} plan! Credits added.`);
        } catch (error) {
            alert("Error selecting plan: " + error.message);
        }
    };

    return (
        <div style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Choose Your Plan</h1>
            <p style={{ color: '#64748b', marginBottom: '3rem' }}>Upgrade to continue using our services and get more credits.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                {/* Trial Plan */}
                <div style={planCardStyle}>
                    <h2 style={{ color: '#64748b' }}>Trial</h2>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' }}>Free</div>
                    <ul style={listStyle}>
                        <li>10 Credits initial</li>
                        <li>Basic search only</li>
                        <li>Limited support</li>
                    </ul>
                    <button disabled style={{ ...btnStyle, background: '#e2e8f0', cursor: 'not-allowed' }}>
                        {userProfile?.plan === 'trial' ? 'Current Plan' : 'Not Available'}
                    </button>
                </div>

                {/* 1 Month Plan */}
                <div style={{ ...planCardStyle, border: '2px solid #2563eb', transform: 'scale(1.05)' }}>
                    <div style={{ background: '#2563eb', color: 'white', padding: '0.25rem 1rem', borderRadius: '20px', fontSize: '0.8rem', position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)' }}>POPULAR</div>
                    <h2 style={{ color: '#1e40af' }}>1 Month</h2>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' }}>₹2,000</div>
                    <ul style={listStyle}>
                        <li>Unlimited Company access</li>
                        <li>500 Credits</li>
                        <li>Priority Support</li>
                    </ul>
                    <button onClick={() => selectPlan('monthly', 2000, 500)} style={btnStyle}>Select Monthly</button>
                </div>

                {/* 1 Year Plan */}
                <div style={planCardStyle}>
                    <h2>1 Year</h2>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', margin: '1rem 0' }}>₹10,000</div>
                    <ul style={listStyle}>
                        <li>Best Value</li>
                        <li>3000 Credits</li>
                        <li>24/7 Premium Support</li>
                    </ul>
                    <button onClick={() => selectPlan('yearly', 10000, 3000)} style={btnStyle}>Select Yearly</button>
                </div>
            </div>

            <button onClick={() => window.location.reload()} style={{ marginTop: '3rem', background: 'none', border: 'none', color: '#2563eb', textDecoration: 'underline', cursor: 'pointer' }}>
                Back to Dashboard
            </button>
        </div>
    );
};

const planCardStyle = {
    background: 'white',
    padding: '2.5rem',
    borderRadius: '16px',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
};

const listStyle = {
    listStyle: 'none',
    padding: 0,
    margin: '1.5rem 0',
    textAlign: 'left',
    color: '#475569',
    lineHeight: '2'
};

const btnStyle = {
    marginTop: 'auto',
    width: '100%',
    padding: '0.8rem',
    borderRadius: '8px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.2s'
};

export default PlansPage;
