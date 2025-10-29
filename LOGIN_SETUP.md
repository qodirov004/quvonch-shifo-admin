# Login Setup Guide

## Django Superuser yaratish

Agar sizda Django superuser yo'q bo'lsa, quyidagi buyruqlar orqali yarating:

```bash
# Django loyihangiz papkasiga o'ting
cd your-django-project

# Superuser yaratish
python manage.py createsuperuser

# Username: admin
# Email: admin@example.com (ixtiyoriy)
# Password: admin (yoki o'zingiz xohlagan parol)
```

## API Server ishga tushirish

```bash
# Django development server ishga tushiring
python manage.py runserver 127.0.0.1:8000
```

## Admin Dashboard ishga tushirish

```bash
# Admin dashboard papkasiga o'ting
cd quvonch-admin-dashboard

# Dependencies o'rnating
npm install

# Development server ishga tushiring
npm run dev
```

## Test qilish

API connection test qilish uchun:

```bash
node test-api.js
```

## Login ma'lumotlari

- **Username**: admin
- **Password**: admin (yoki o'zingiz yaratgan parol)
- **API URL**: https://api.greentraver.uz

## Xatoliklar

Agar login qilishda muammo bo'lsa:

1. Django API server ishlayotganini tekshiring
2. Superuser yaratilganini tekshiring
3. Browser console da xatoliklarni ko'ring
4. Network tab da API so'rovlarini tekshiring

## Debug

Login sahifasida console.log qo'shilgan, browser console da quyidagi ma'lumotlarni ko'rishingiz mumkin:
- Login so'rovi ma'lumotlari
- Response status
- Xatolik ma'lumotlari
