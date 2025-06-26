import { useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { DiagnosisFormState, DiagnosisResponse } from '../types';
import ImageUploader from '../components/ImageUploader';
import ContextForm from '../components/ContextForm';
import { DiagnosisResult } from '../components/DiagnosisResult';

const Home: NextPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [formState, setFormState] = useState<DiagnosisFormState>({
    plantType: '',
    location: '',
    watering: '',
    sunlight: '',
  });
  const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      formData.append(key, value);
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
        <meta name="description" content="Debug your plants with AI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            Plant Debugger
          </h1>
          <p className={styles.description}>
            Upload pictures of your sick plant and provide some context to start debugging.
          </p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>1. Upload Images</h2>
            <div style={{ marginBottom: '0.5rem', color: '#888', fontSize: '0.98em' }}>
              <strong>Tip:</strong> For best results, upload clear, well-lit photos showing the affected parts of your plant (leaves, stems, soil). Avoid blurry or dark images.
            </div>
            <ImageUploader files={files} onFilesChange={setFiles} />
          </div>

          <div className={styles.formSection}>
            <h2 className={styles.sectionTitle}>2. Provide Context</h2>
            <ContextForm formState={formState} onFormChange={handleFormChange} />
          </div>

          <button type="submit" disabled={isLoading} className={styles.submitButton}>
            {isLoading ? 'Diagnosing...' : 'Get Diagnosis'}
          </button>
        </form>

        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Analyzing your plant... this may take a moment.</p>
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