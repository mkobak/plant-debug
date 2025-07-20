import { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { DiagnosisFormState, DiagnosisResponse } from '../types';
import ImageUploader from '../components/ImageUploader';
import ContextForm from '../components/ContextForm';
import { DiagnosisResult } from '../components/DiagnosisResult';

const Home: NextPage = () => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [formState, setFormState] = useState<DiagnosisFormState>({
    plantType: '',
    location: '',
    wateringFrequency: '',
    wateringAmount: '',
    wateringMethod: '',
    sunlight: '',
    sunlightHours: '',
    soilType: '',
    fertilizer: '',
    humidity: '',
    temperature: '',
    pests: '',
    symptoms: [],
    potDetails: '',
    recentChanges: '',
    plantAge: '',
    description: '',
  });
  const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please upload at least one image of your plant.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setDiagnosis(null);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    Object.entries(formState).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(key, v));
      } else {
        formData.append(key, value);
      }
    });

    try {
      const response = await fetch('/api/v1/diagnose', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An unknown error occurred.');
      }

      const result = await response.json();
      setDiagnosis(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Plant Debugger</title>
        <meta name="description" content="Debug your plants" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <header className={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
            <img src="/logo.png" alt="Plant Debug Logo" style={{ height: '55px', width: '55px', objectFit: 'contain', marginRight: '0.5rem' }} />
            <h1 className={styles.title} style={{ margin: 0 }}>
              Plant Debugger
            </h1>
          </div>
          <p className={styles.description}>
            Upload pictures of your sad plant and provide some additional information to start debugging.
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>1. Upload images</h2>
            <div style={{ marginBottom: '0.5rem', color: '#888', fontSize: '0.98em' }}>
              <strong>Tip:</strong> For best results, upload clear, well-lit photos showing the affected parts of your plant. Avoid blurry or dark images.
            </div>
            <ImageUploader files={files} onFilesChange={setFiles} />
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>2. Provide more information (optional)</h2>
            <ContextForm formState={{ ...formState, location: '', wateringFrequency: '', wateringAmount: '', wateringMethod: '', sunlight: '', sunlightHours: '', soilType: '', fertilizer: '', humidity: '', temperature: '', pests: '', symptoms: [], potDetails: '', recentChanges: '', plantAge: '' }} onFormChange={handleFormChange} fields={['plantType', 'description']} />
            <details style={{ marginTop: '0.5rem' }} open={detailsOpen} onToggle={e => setDetailsOpen(e.currentTarget.open)}>
              <summary
                style={{
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1.15em',
                  color: '#444',
                  padding: '0.7em 0.7em 0.7em 0.9em',
                  background: '#f7f7fa',
                  borderRadius: '6px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                  border: '1px solid #e0e0e0',
                  position: 'relative',
                  transition: 'background 0.2s',
                  userSelect: 'none',
                }}
                onMouseOver={e => (e.currentTarget.style.background = '#ececf6')}
                onMouseOut={e => (e.currentTarget.style.background = '#f7f7fa')}
              >
              Provide even more information
              </summary>
              <div style={{ marginTop: '1em', display: 'flex', flexDirection: 'column', gap: '1em' }}>
                <ContextForm formState={formState} onFormChange={handleFormChange} fields={['location', 'wateringFrequency', 'wateringAmount', 'wateringMethod', 'sunlight', 'sunlightHours', 'soilType', 'fertilizer', 'humidity', 'temperature', 'pests', 'symptoms', 'potDetails', 'recentChanges', 'plantAge']} />
              </div>
            </details>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit" disabled={isLoading} className={styles.submitButton}>
              {isLoading ? 'Debugging...' : 'Debug'}
            </button>
            <button
              type="button"
              className={styles.submitButton}
              style={{ background: '#eee', color: '#333', border: '1px solid #ccc' }}
              onClick={() => {
                setFiles([]);
                setFormState({
                  plantType: '',
                  location: '',
                  wateringFrequency: '',
                  wateringAmount: '',
                  wateringMethod: '',
                  sunlight: '',
                  sunlightHours: '',
                  soilType: '',
                  fertilizer: '',
                  humidity: '',
                  temperature: '',
                  pests: '',
                  symptoms: [],
                  potDetails: '',
                  recentChanges: '',
                  plantAge: '',
                  description: '',
                });
                setDiagnosis(null);
                setError(null);
              }}
              disabled={isLoading}
            >
              Reset
            </button>
          </div>
        </form>

        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Debugging your plant... this may take a moment.</p>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}

        {diagnosis && <DiagnosisResult diagnosis={diagnosis} />}
      </main>

      <footer className={styles.footer}>
        <p></p>
      </footer>
    </div>
  );
};

export default Home;