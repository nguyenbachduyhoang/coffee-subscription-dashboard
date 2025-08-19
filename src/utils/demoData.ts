interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
  status: 'active' | 'inactive';
}

interface Package {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
  features: string[];
  isPopular: boolean;
}

interface Order {
  id: string;
  userId: string;
  userName: string;
  packageName: string;
  total: number;
  createdAt: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: 'vnpay' | 'card' | 'other';
}

const generateDemoUsers = (): User[] => [
  {
    id: 'USR001',
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@email.com',
    phone: '0901234567',
    registeredAt: '15/11/2024',
    status: 'active'
  },
  {
    id: 'USR002',
    name: 'Trần Thị Bình',
    email: 'tranthibinh@email.com',
    phone: '0912345678',
    registeredAt: '12/11/2024',
    status: 'active'
  },
  {
    id: 'USR003',
    name: 'Lê Minh Cường',
    email: 'leminhcuong@email.com',
    phone: '0923456789',
    registeredAt: '08/11/2024',
    status: 'inactive'
  },
  {
    id: 'USR004',
    name: 'Phạm Thu Dung',
    email: 'phamthudung@email.com',
    phone: '0934567890',
    registeredAt: '05/11/2024',
    status: 'active'
  },
  {
    id: 'USR005',
    name: 'Hoàng Văn Em',
    email: 'hoangvanem@email.com',
    phone: '0945678901',
    registeredAt: '02/11/2024',
    status: 'active'
  }
];

const generateDemoPackages = (): Package[] => [
  {
    id: 'PKG001',
    name: 'Gói Cơ Bản',
    price: 150000,
    duration: 1,
    description: 'Gói cà phê cơ bản cho người mới bắt đầu',
    features: [
      '2 túi cà phê/tháng',
      'Giao hàng miễn phí',
      'Tư vấn cơ bản',
      'Hủy bất kỳ lúc nào'
    ],
    isPopular: false
  },
  {
    id: 'PKG002',
    name: 'Gói Tiêu Chuẩn',
    price: 300000,
    duration: 1,
    description: 'Gói phổ biến nhất cho người yêu cà phê',
    features: [
      '4 túi cà phê/tháng',
      'Giao hàng miễn phí',
      'Tư vấn chuyên nghiệp',
      'Quà tặng hàng tháng',
      'Ưu tiên hỗ trợ'
    ],
    isPopular: true
  },
  {
    id: 'PKG003',
    name: 'Gói Premium',
    price: 450000,
    duration: 1,
    description: 'Trải nghiệm cà phê cao cấp',
    features: [
      '6 túi cà phê premium/tháng',
      'Giao hàng nhanh',
      'Tư vấn cá nhân hóa',
      'Quà tặng độc quyền',
      'Hỗ trợ 24/7',
      'Thử nghiệm loại mới'
    ],
    isPopular: false
  },
  {
    id: 'PKG004',
    name: 'Gói VIP',
    price: 600000,
    duration: 1,
    description: 'Dành cho tín đồ cà phê chuyên nghiệp',
    features: [
      '8 túi cà phê đặc biệt/tháng',
      'Giao hàng trong ngày',
      'Chuyên gia tư vấn riêng',
      'Quà tặng cao cấp',
      'Ưu tiên tuyệt đối',
      'Cà phê giới hạn',
      'Workshop miễn phí'
    ],
    isPopular: false
  }
];

const generateDemoOrders = (): Order[] => [
  {
    id: 'ORD-2024-001',
    userId: 'USR001',
    userName: 'Nguyễn Văn An',
    packageName: 'Gói Tiêu Chuẩn',
    total: 300000,
    createdAt: '15/12/2024',
    status: 'completed',
    paymentMethod: 'vnpay'
  },
  {
    id: 'ORD-2024-002',
    userId: 'USR002',
    userName: 'Trần Thị Bình',
    packageName: 'Gói Premium',
    total: 450000,
    createdAt: '14/12/2024',
    status: 'pending',
    paymentMethod: 'card'
  },
  {
    id: 'ORD-2024-003',
    userId: 'USR003',
    userName: 'Lê Minh Cường',
    packageName: 'Gói Cơ Bản',
    total: 150000,
    createdAt: '13/12/2024',
    status: 'completed',
    paymentMethod: 'vnpay'
  },
  {
    id: 'ORD-2024-004',
    userId: 'USR004',
    userName: 'Phạm Thu Dung',
    packageName: 'Gói VIP',
    total: 600000,
    createdAt: '12/12/2024',
    status: 'completed',
    paymentMethod: 'other'
  },
  {
    id: 'ORD-2024-005',
    userId: 'USR005',
    userName: 'Hoàng Văn Em',
    packageName: 'Gói Tiêu Chuẩn',
    total: 300000,
    createdAt: '11/12/2024',
    status: 'cancelled',
    paymentMethod: 'card'
  }
];

let users: User[] = generateDemoUsers();
let packages: Package[] = generateDemoPackages();
let orders: Order[] = generateDemoOrders();

const STORAGE_KEYS = {
  USERS: 'coffee-admin-users',
  PACKAGES: 'coffee-admin-packages',
  ORDERS: 'coffee-admin-orders'
};

const loadFromStorage = () => {
  try {
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const storedPackages = localStorage.getItem(STORAGE_KEYS.PACKAGES);
    const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);

    if (storedUsers) users = JSON.parse(storedUsers);
    if (storedPackages) packages = JSON.parse(storedPackages);
    if (storedOrders) orders = JSON.parse(storedOrders);
  } catch (error) {
    console.error('Error loading data from localStorage:', error);
  }
};

const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.PACKAGES, JSON.stringify(packages));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  } catch (error) {
    console.error('Error saving data to localStorage:', error);
  }
};

// Load data on module initialization
loadFromStorage();

export const getDemoData = () => {
  return { users, packages, orders };
};

export const addUser = (userData: Omit<User, 'id'>): User => {
  const newUser: User = {
    ...userData,
    id: `USR${String(users.length + 1).padStart(3, '0')}`,
    registeredAt: new Date().toLocaleDateString('vi-VN')
  };
  users.push(newUser);
  saveToStorage();
  return newUser;
};

export const updateUser = (id: string, userData: Partial<User>): User => {
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...userData };
    saveToStorage();
  }
  return users[index];
};

export const deleteUser = (id: string): void => {
  users = users.filter(u => u.id !== id);
  saveToStorage();
};

export const addPackage = (packageData: Omit<Package, 'id'>): Package => {
  const newPackage: Package = {
    ...packageData,
    id: `PKG${String(packages.length + 1).padStart(3, '0')}`
  };
  packages.push(newPackage);
  saveToStorage();
  return newPackage;
};

export const updatePackage = (id: string, packageData: Partial<Package>): Package => {
  const index = packages.findIndex(p => p.id === id);
  if (index !== -1) {
    packages[index] = { ...packages[index], ...packageData };
    saveToStorage();
  }
  return packages[index];
};

export const deletePackage = (id: string): void => {
  packages = packages.filter(p => p.id !== id);
  saveToStorage();
};