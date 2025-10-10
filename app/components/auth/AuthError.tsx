interface AuthErrorProps {
  errors: Record<string, string>;
}

export function AuthError({ errors }: AuthErrorProps) {
  const errorMessages = Object.values(errors);

  if (errorMessages.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        backgroundColor: '#fee',
        border: '1px solid #fcc',
        borderRadius: '4px',
        padding: '12px',
        marginBottom: '16px',
        color: '#c33'
      }}
    >
      <ul style={{ margin: 0, paddingLeft: '20px' }}>
        {errorMessages.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
}