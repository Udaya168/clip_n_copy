const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf8');

// add imports
if (!code.includes('Package,')) code = code.replace('Settings,', 'Settings,\n  Package,\n  Truck,\n  RotateCcw,');

// replace account section and below
const startIndex = code.indexOf('{/* 4. Account / Login */}');
const endIndex = code.indexOf('{/* Spacing for call button */}');

const newContent = `{/* 4. Account */}
              <div className="pt-2">
                <div className="h-[1px] w-full bg-[#E5EAF2] mb-4" />
                <div className="flex flex-col gap-1.5">
                  {!user ? (
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="group flex items-center gap-3 h-[48px] px-3.5 rounded-xl text-foreground hover:bg-secondary transition-colors font-medium"
                    >
                      <User className="size-[18px] text-primary" />
                      <span className="text-[14px] flex-1">Login</span>
                      <ChevronRight className="size-[18px] text-muted-foreground/50" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/account"
                        onClick={() => setMobileMenuOpen(false)}
                        className="group flex items-center gap-3 h-[48px] px-3.5 rounded-xl text-foreground hover:bg-secondary transition-colors font-medium"
                      >
                        <UserCheck className="size-[18px] text-primary" />
                        <span className="text-[14px] flex-1">My Account</span>
                        <ChevronRight className="size-[18px] text-muted-foreground/50" />
                      </Link>
                      
                      <Link
                        to="/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="group flex items-center gap-3 h-[48px] px-3.5 rounded-xl text-foreground hover:bg-secondary transition-colors font-medium"
                      >
                        <Package className="size-[18px] text-primary" />
                        <span className="text-[14px] flex-1">My Orders</span>
                        <ChevronRight className="size-[18px] text-muted-foreground/50" />
                      </Link>

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          signOut();
                        }}
                        className="group w-full text-left flex items-center gap-3 h-[48px] px-3.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors font-medium cursor-pointer"
                      >
                        <LogOut className="size-[18px]" />
                        <span className="text-[14px] flex-1">Logout</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 5. Support */}
              <div className="pt-2">
                <div className="h-[1px] w-full bg-[#E5EAF2] mb-4" />
                <h3 className="text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground px-2 mb-3">
                  Support
                </h3>
                <div className="flex flex-col gap-1.5">
                  <Link
                    to="/help"
                    onClick={() => setMobileMenuOpen(false)}
                    className="group flex items-center gap-3 h-[48px] px-3.5 rounded-xl text-foreground hover:bg-secondary transition-colors font-medium"
                  >
                    <CircleHelp className="size-[18px] text-primary" />
                    <span className="text-[14px] flex-1">Help & Support</span>
                    <ChevronRight className="size-[18px] text-muted-foreground/50" />
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setMobileMenuOpen(false)}
                    className="group flex items-center gap-3 h-[48px] px-3.5 rounded-xl text-foreground hover:bg-secondary transition-colors font-medium"
                  >
                    <Phone className="size-[18px] text-primary" />
                    <span className="text-[14px] flex-1">Contact Us</span>
                    <ChevronRight className="size-[18px] text-muted-foreground/50" />
                  </Link>
                  <Link
                    to="/track-order"
                    onClick={() => setMobileMenuOpen(false)}
                    className="group flex items-center gap-3 h-[48px] px-3.5 rounded-xl text-foreground hover:bg-secondary transition-colors font-medium"
                  >
                    <Truck className="size-[18px] text-primary" />
                    <span className="text-[14px] flex-1">Track Order</span>
                    <ChevronRight className="size-[18px] text-muted-foreground/50" />
                  </Link>
                  <Link
                    to="/returns"
                    onClick={() => setMobileMenuOpen(false)}
                    className="group flex items-center gap-3 h-[48px] px-3.5 rounded-xl text-foreground hover:bg-secondary transition-colors font-medium"
                  >
                    <RotateCcw className="size-[18px] text-primary" />
                    <span className="text-[14px] flex-1">Returns</span>
                    <ChevronRight className="size-[18px] text-muted-foreground/50" />
                  </Link>
                </div>
              </div>

              `;

if (startIndex !== -1 && endIndex !== -1) {
  code = code.substring(0, startIndex) + newContent + code.substring(endIndex);
  fs.writeFileSync('src/components/Header.tsx', code);
  console.log('Successfully updated Header.tsx');
} else {
  console.log('Failed to find start/end markers in Header.tsx');
}
