import { db } from '../lib/firebase';
import {
  collection, addDoc, getDocs, query, orderBy,
  serverTimestamp, doc, updateDoc, deleteDoc
} from 'firebase/firestore';

const LEADS_COLLECTION = 'leads';
const CAMPAIGNS_COLLECTION = 'campaigns';
const USERS_COLLECTION = 'users';
const HISTORY_COLLECTION = 'history';

export const addLead = async (leadData: any, userId: string) => {
  try {
    const docRef = await addDoc(collection(db, LEADS_COLLECTION), {
      ...leadData, userId, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error adding lead:', error);
    return { success: false, error: error.message };
  }
};

export const getLeads = async (userId: string) => {
  try {
    const q = query(collection(db, LEADS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const leads: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId === userId) leads.push({ id: doc.id, ...data });
    });
    return leads;
  } catch (error) {
    console.error('Error getting leads:', error);
    return [];
  }
};

export const deleteLead = async (leadId: string) => {
  try {
    await deleteDoc(doc(db, LEADS_COLLECTION, leadId));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const addCampaign = async (campaignData: any, userId: string) => {
  try {
    const docRef = await addDoc(collection(db, CAMPAIGNS_COLLECTION), {
      ...campaignData, userId, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getCampaigns = async (userId: string) => {
  try {
    const q = query(collection(db, CAMPAIGNS_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const campaigns: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId === userId) campaigns.push({ id: doc.id, ...data });
    });
    return campaigns;
  } catch (error) {
    return [];
  }
};

export const updateCampaign = async (campaignId: string, updates: any) => {
  try {
    await updateDoc(doc(db, CAMPAIGNS_COLLECTION, campaignId), { ...updates, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteCampaign = async (campaignId: string) => {
  try {
    await deleteDoc(doc(db, CAMPAIGNS_COLLECTION, campaignId));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users: any[] = [];
    querySnapshot.forEach((doc) => { users.push({ id: doc.id, ...doc.data() }); });
    return users;
  } catch (error) {
    return [];
  }
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), { ...profileData, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getAnalytics = async (userId: string) => {
  try {
    const [leads, users, campaigns] = await Promise.all([
      getLeads(userId), getUsers(), getCampaigns(userId)
    ]);
    return {
      totalLeads: leads.length,
      totalUsers: users.length,
      totalCampaigns: campaigns.length,
      recentLeads: leads.slice(0, 5)
    };
  } catch (error) {
    return { totalLeads: 0, totalUsers: 0, totalCampaigns: 0, recentLeads: [] };
  }
};

export const addCallHistory = async (userId: string, callData: any) => {
  try {
    const docRef = await addDoc(collection(db, HISTORY_COLLECTION), {
      ...callData, userId, createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getCallHistory = async (userId: string) => {
  try {
    const q = query(collection(db, HISTORY_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const history: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId === userId) history.push({ id: doc.id, ...data });
    });
    return history;
  } catch (error) {
    return [];
  }
};
