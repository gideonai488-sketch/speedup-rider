import React, { useState } from 'react';
import { Globe, ChevronDown, Check, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCountry } from '@/context/CountryContext';
import { allCountries, CountryCode } from '@/config/countries';
import { languageNames } from '@/i18n/translations';
import { Badge } from '@/components/ui/badge';

interface CountrySelectorProps {
  variant?: 'compact' | 'full';
  className?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ variant = 'compact', className = '' }) => {
  const { country, countryCode, language, setCountry, setLanguage } = useCountry();
  const [open, setOpen] = useState(false);

  if (variant === 'compact') {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={`gap-1.5 text-sm font-medium ${className}`}>
            <span className="text-base">{country.flag}</span>
            <span className="hidden sm:inline">{country.currencySymbol}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Select Country
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {allCountries.map((c) => (
            <DropdownMenuItem
              key={c.code}
              onClick={() => !c.comingSoon && setCountry(c.code)}
              className={`flex items-center justify-between gap-3 ${c.comingSoon ? 'opacity-50' : 'cursor-pointer'}`}
              disabled={c.comingSoon}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{c.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.currencySymbol} · {c.currency}</span>
                </div>
              </div>
              {c.comingSoon ? (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Soon</Badge>
              ) : countryCode === c.code ? (
                <Check className="w-4 h-4 text-primary" />
              ) : null}
            </DropdownMenuItem>
          ))}
          
          {country.supportedLanguages.length > 1 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Language
              </DropdownMenuLabel>
              {country.supportedLanguages.map((lang) => (
                <DropdownMenuItem
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm">{languageNames[lang]}</span>
                  {language === lang && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full variant for landing page / settings
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 ${className}`}>
      {allCountries.map((c) => (
        <button
          key={c.code}
          onClick={() => !c.comingSoon && setCountry(c.code)}
          className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
            countryCode === c.code
              ? 'border-primary bg-primary/5 shadow-md'
              : c.comingSoon
              ? 'border-border/50 opacity-60 cursor-not-allowed'
              : 'border-border hover:border-primary/40 hover:bg-card cursor-pointer'
          }`}
          disabled={c.comingSoon}
        >
          {c.comingSoon && (
            <Badge variant="secondary" className="absolute -top-2 right-2 text-[9px] px-1.5 py-0">
              Soon
            </Badge>
          )}
          <span className="text-3xl">{c.flag}</span>
          <span className="font-semibold text-foreground text-sm">{c.name}</span>
          <span className="text-xs text-muted-foreground">{c.currencySymbol} · {c.currency}</span>
        </button>
      ))}
    </div>
  );
};

export default CountrySelector;
