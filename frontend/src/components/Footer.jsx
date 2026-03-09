import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-squash-dark text-white mt-12 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-squash-secondary">About</a></li>
              <li><a href="#" className="hover:text-squash-secondary">Contact</a></li>
              <li><a href="#" className="hover:text-squash-secondary">Rules</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-squash-secondary">Help Center</a></li>
              <li><a href="#" className="hover:text-squash-secondary">FAQ</a></li>
              <li><a href="#" className="hover:text-squash-secondary">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-squash-secondary">Privacy</a></li>
              <li><a href="#" className="hover:text-squash-secondary">Terms</a></li>
              <li><a href="#" className="hover:text-squash-secondary">Cookies</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Follow</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-squash-secondary">Twitter</a></li>
              <li><a href="#" className="hover:text-squash-secondary">Facebook</a></li>
              <li><a href="#" className="hover:text-squash-secondary">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-squash-primary pt-4 text-center text-sm">
          <p>&copy; 2024 International Squash Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
