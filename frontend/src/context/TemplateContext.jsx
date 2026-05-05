import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from './AuthContext';

export const TemplateContext = createContext();

export const TemplateProvider = ({ children }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useContext(AuthContext);

  const fetchTemplates = async () => {
    try {
      console.log("Fetching templates...");
      const res = await api.get('/templates');
      console.log("Fetched templates:", res.data.length);
      setTemplates(res.data);
    } catch (err) {
      console.error("Failed to fetch templates", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTemplates();
    }
  }, [token]);

  const addTemplate = (newTemplate) => {
    setTemplates(prev => [...prev, newTemplate]);
  };

  const removeTemplate = (id) => {
    setTemplates(prev => prev.filter(t => t.id !== parseInt(id)));
  };

  const updateTemplateList = (updatedTemplate) => {
    setTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
  };

  return (
    <TemplateContext.Provider value={{ templates, fetchTemplates, addTemplate, removeTemplate, updateTemplateList, loading }}>
      {children}
    </TemplateContext.Provider>
  );
};
