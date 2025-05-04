from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

from adminpanel.models import BaseModel


#------------------------------User---------------------------------




class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('first_name', 'Admin')  
        extra_fields.setdefault('last_name', 'Superuser')  

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin, BaseModel):
    GENDER_CHOICES = [('male', 'Male'), ('female', 'Female')]
    
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=150, blank=True, null=True)
    last_name = models.CharField(max_length=150, blank=True, null=True)
    
    gender = models.CharField(max_length=6, choices=GENDER_CHOICES, blank=True, null=True)

    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] 

    class Meta:
        db_table = 'webapp_user'

    def __str__(self):
        return f'{self.first_name} {self.last_name}'

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}' if self.first_name and self.last_name else self.email
    
    
    
class UserProfile(BaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    height = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(250)], null=True, blank=True)
    weight = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(250)], null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True) 
    job = models.CharField(max_length=255, null=True, blank=True)

    
class Address(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    address = models.CharField(max_length=255)
    city = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    zip_code = models.CharField(max_length=10)

    

#---------------------------Biometrics---------------------------------

class BiometricsEntry(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='biometrics_entries')
    health_score = models.FloatField()  
    
    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f'{self.user.get_full_name()}'

class Biometrics(BaseModel):
    biochemical = models.ForeignKey('adminpanel.Biochemical', on_delete=models.CASCADE, related_name='biometrics')
    biometricsentry = models.ForeignKey(BiometricsEntry, on_delete=models.CASCADE, related_name='biometrics')
    value = models.FloatField()
    scaled_value = models.FloatField()  
    health_weight = models.FloatField() 
    is_hyper = models.BooleanField(null=True) 
    expiry_date = models.DateTimeField()
    

    class Meta:
        indexes = [
            models.Index(fields=['biochemical']),
            models.Index(fields=['biometricsentry']),
        ]

    def __str__(self):
        return f'{self.biometricsentry.user.get_full_name()} - {self.biochemical.name} - {self.scaled_value}'

#------------------------Foods Score--------------------------------


class FoodsScore(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='food_scores')
    foods_score = models.JSONField()  

    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f'{self.user.get_full_name()}'

#------------------------Records--------------------------------

class Record(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='records')
    text = models.TextField(null=True, blank=True)  
    file_1 = models.TextField(null=True, blank=True)
    file_2 = models.TextField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f'{self.user.get_full_name()}'

