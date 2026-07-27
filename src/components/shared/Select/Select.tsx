'use client';

import React, { useId } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export default function Select({
  label,
  error,
  hint,
  fullWidth = false,
  options,
  placeholder,
  id,
  onChange,
  required,
  value,
  className,
  disabled,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  const wrapperClass = [styles.wrapper, fullWidth ? styles.fullWidth : ''].filter(Boolean).join(' ');

  const selectClass = [
    styles.select,
    error ? styles.selectError : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClass}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
          {required && (
            <span className={styles.required} aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      <select
        id={selectId}
        className={selectClass}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
        }
        required={required}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={`${selectId}-error`} className={styles.errorText} role="alert">
          {error}
        </span>
      )}
      {!error && hint && (
        <span id={`${selectId}-hint`} className={styles.hintText}>
          {hint}
        </span>
      )}
    </div>
  );
}
