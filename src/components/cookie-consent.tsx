import  { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Cookies from 'js-cookie';

const CookieConsent = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const consent = Cookies.get('cookieConsent');
    if (!consent) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
      Cookies.set('cookieConsent', 'true', { expires: 365, secure: true, sameSite: 'Lax' });
      setIsOpen(false);
    };
    
    const handleDecline = () => {
      Cookies.set('cookieConsent', 'false', { expires: 365, secure: true, sameSite: 'Lax' });
      setIsOpen(false);
    };
    

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cookie Consent</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>We use cookies to improve your experience on our site. By using our site, you consent to cookies.</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleDecline}>
              Decline
            </Button>
            <Button onClick={handleAccept}>
              Accept
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CookieConsent;