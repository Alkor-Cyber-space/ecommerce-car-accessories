import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='VehicleMake',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('available', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='VehicleModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('available', models.BooleanField(default=True)),
                ('make', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='models', to='vehicles.vehiclemake')),
            ],
        ),
        migrations.CreateModel(
            name='VehicleVariant',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('variant', models.CharField(choices=[('PETROL', 'petrol'), ('DIESEL', 'diesel'), ('CNG', 'cng'), ('ELECTRIC', 'electric')], max_length=20)),
                ('year', models.PositiveIntegerField()),
                ('make', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='variants', to='vehicles.vehiclemake')),
                ('model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='variants', to='vehicles.vehiclemodel')),
            ],
            options={
                'unique_together': {('make', 'model', 'variant', 'year')},
            },
        ),
        migrations.CreateModel(
            name='SavedVehicle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('saved_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_vehicles', to=settings.AUTH_USER_MODEL)),
                ('vehicle_variant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_by_users', to='vehicles.vehiclevariant')),
            ],
            options={
                'unique_together': {('user', 'vehicle_variant')},
            },
        ),
    ]
