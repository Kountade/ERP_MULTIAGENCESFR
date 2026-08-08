// src/components/MyTextField.jsx (Version complète)
import React, { useState } from 'react';
import { Controller } from 'react-hook-form';

export default function MyTextField(props) {
  const { 
    label, 
    name, 
    control, 
    placeholder = "",
    type = "text",
    required = false,
    disabled = false,
    size = "md",
    variant = "primary",
    autoComplete = "off",
    rows = 3,
    multiline = false,
    icon, // Icône à gauche
    iconPosition = "left", // left ou right
    clearable = false, // Bouton pour effacer
    counter = false, // Afficher le compteur de caractères
    maxLength, // Longueur maximale
    minLength,
    pattern,
    transform // Fonction de transformation (ex: uppercase)
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const sizeClasses = {
    sm: 'input-sm',
    md: 'input-md',
    lg: 'input-lg',
  };

  const variantClasses = {
    primary: 'input-primary',
    secondary: 'input-secondary',
    accent: 'input-accent',
    ghost: 'input-ghost',
  };

  const handleClear = (onChange) => {
    onChange('');
  };

  const handleChange = (e, onChange) => {
    let value = e.target.value;
    
    // Transformation du texte
    if (transform === 'uppercase') value = value.toUpperCase();
    if (transform === 'lowercase') value = value.toLowerCase();
    if (transform === 'capitalize') {
      value = value.replace(/\b\w/g, c => c.toUpperCase());
    }
    
    setCharCount(value.length);
    onChange(value);
  };

  return (
    <Controller
      name={name}
      control={control}
      rules={{ required, minLength, maxLength, pattern }}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="form-control w-full">
          {/* Label avec compteur */}
          <label className="label">
            <span className="label-text font-medium">
              {label}
              {required && <span className="text-error ml-1">*</span>}
            </span>
            {counter && maxLength && (
              <span className="label-text-alt text-base-content/60">
                {charCount}/{maxLength}
              </span>
            )}
          </label>

          {/* Container pour l'input avec icône */}
          <div className="relative">
            {/* Icône à gauche */}
            {icon && iconPosition === 'left' && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {typeof icon === 'string' ? (
                  <span className="text-base-content/60">{icon}</span>
                ) : (
                  icon
                )}
              </div>
            )}

            {/* Input ou Textarea */}
            {multiline ? (
              <textarea
                value={value ?? ''}
                onChange={(e) => handleChange(e, onChange)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                maxLength={maxLength}
                className={`
                  textarea textarea-bordered w-full
                  ${size === 'lg' ? 'textarea-lg' : size === 'sm' ? 'textarea-sm' : 'textarea-md'}
                  ${variantClasses[variant]}
                  ${error ? 'textarea-error' : ''}
                  ${disabled ? 'textarea-disabled' : ''}
                  ${icon && iconPosition === 'left' ? 'pl-10' : ''}
                  ${(clearable || (icon && iconPosition === 'right')) ? 'pr-10' : ''}
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${isFocused ? `ring-2 ring-offset-2 ring-${variant}` : ''}
                `}
              />
            ) : (
              <input
                type={type}
                value={value ?? ''}
                onChange={(e) => handleChange(e, onChange)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
                maxLength={maxLength}
                className={`
                  input input-bordered w-full
                  ${sizeClasses[size]}
                  ${variantClasses[variant]}
                  ${error ? 'input-error' : ''}
                  ${disabled ? 'input-disabled' : ''}
                  ${icon && iconPosition === 'left' ? 'pl-10' : ''}
                  ${(clearable || (icon && iconPosition === 'right')) ? 'pr-10' : ''}
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${isFocused ? `ring-2 ring-offset-2 ring-${variant}` : ''}
                `}
              />
            )}

            {/* Bouton clear (effacer) */}
            {clearable && value && !disabled && (
              <button
                type="button"
                onClick={() => handleClear(onChange)}
                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-ghost btn-circle btn-xs"
                aria-label="Effacer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {/* Icône à droite */}
            {icon && iconPosition === 'right' && !clearable && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {typeof icon === 'string' ? (
                  <span className="text-base-content/60">{icon}</span>
                ) : (
                  icon
                )}
              </div>
            )}
          </div>

          {/* Message d'erreur */}
          {error && (
            <label className="label">
              <div className="flex items-center gap-1 text-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="label-text-alt">{error?.message}</span>
              </div>
            </label>
          )}

          {/* Message d'aide */}
          {props.helperText && !error && (
            <label className="label">
              <span className="label-text-alt text-base-content/60">{props.helperText}</span>
            </label>
          )}
        </div>
      )}
    />
  );
}