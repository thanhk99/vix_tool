'use client';

import React from 'react';
import Input from './Input';

interface CurrencyInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value' | 'type'> {
  value?: number | string;
  onChangeValue?: (value: number) => void;
}

export default function CurrencyInput({ value, onChangeValue, ...props }: CurrencyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Keep only digits
    const numericStr = rawVal.replace(/\D/g, '');
    
    if (!numericStr) {
      onChangeValue?.(0);
      return;
    }

    onChangeValue?.(Number(numericStr));
  };

  const displayValue = (value !== undefined && value !== null && value !== '') 
    ? Number(value).toLocaleString('vi-VN') 
    : '';

  return (
    <Input
      {...props}
      type="text"
      value={displayValue}
      onChange={handleChange}
    />
  );
}
