import os
import django
import random
from django.utils import timezone
from datetime import timedelta

# Set up Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ecommerce.settings")
django.setup()

from accounts.models import CustomUser
from products.models import Product, Review

def seed_reviews():
    print("Starting seeding of dummy ratings and reviews...")
    
    # 1. Define and create dummy reviewers
    dummy_users_data = [
        {"email": "john.doe@example.com", "username": "johndoe", "phone": "5551234567"},
        {"email": "jane.smith@example.com", "username": "janesmith", "phone": "5552345678"},
        {"email": "alice.jones@example.com", "username": "alicejones", "phone": "5553456789"},
        {"email": "bob.brown@example.com", "username": "bobbrown", "phone": "5554567890"},
        {"email": "carol.white@example.com", "username": "carolwhite", "phone": "5555678901"}
    ]
    
    reviewers = []
    for user_info in dummy_users_data:
        user, created = CustomUser.objects.get_or_create(
            email=user_info["email"],
            defaults={
                "username": user_info["username"],
                "phone_number": user_info["phone"]
            }
        )
        if created:
            user.set_password("DummyPassword123!")
            user.save()
            print(f"Created new dummy user: {user.username} ({user.email})")
        else:
            print(f"Dummy user already exists: {user.username} ({user.email})")
        reviewers.append(user)
        
    # 2. Define comments for different star ratings to make reviews look authentic
    reviews_pool = {
        5.0: [
            "Absolutely fantastic product! Fits my car perfectly and looks very premium.",
            "Top-notch quality. Well worth the price and the delivery was quick.",
            "Excellent build quality! Installed it easily and it looks superb.",
            "exceeded my expectations. Premium material and great packaging!"
        ],
        4.5: [
            "Very good quality product. Fitting is great, just minor styling preference difference.",
            "Great value for money. Highly recommend this for car enthusiasts.",
            "Solid construction. Feels sturdy and functions exactly as described."
        ],
        4.0: [
            "Pretty good product. Fits well and works fine, though color is slightly different from photo.",
            "Nice quality. Good packaging, but shipping took a day longer.",
            "Satisfied with the purchase. Good finish and overall quality is decent."
        ],
        3.5: [
            "Decent product. Fits okay, but material quality could be a bit better.",
            "Average quality. Works fine but instructions for installation were a bit unclear."
        ],
        3.0: [
            "Just okay. It gets the job done but does not feel very premium.",
            "Average product. Fits slightly loose on the corners."
        ]
    }
    
    # 3. Get all products in the database
    products = Product.objects.all()
    if not products.exists():
        print("No products found in the database. Please add products first.")
        return
        
    print(f"Found {products.count()} products. Adding dummy reviews...")
    
    # For each product, add a random number of reviews (e.g. 2 to 4 reviews per product)
    total_reviews_created = 0
    now = timezone.now()
    
    for product in products:
        # Determine how many reviews to create for this product (between 2 and 4, or limited by number of reviewers)
        num_reviews = min(random.randint(2, 4), len(reviewers))
        
        # Shuffle reviewers to distribute them randomly
        random.shuffle(reviewers)
        selected_reviewers = reviewers[:num_reviews]
        
        print(f"\nAdding {num_reviews} reviews for product: '{product.name}'...")
        
        for i, user in enumerate(selected_reviewers):
            # Check if this user has already reviewed this product (unique_together check)
            if Review.objects.filter(product=product, user=user).exists():
                print(f" - User {user.username} has already reviewed '{product.name}'. Skipping.")
                continue
                
            # Randomly select a rating and a corresponding comment
            rating = random.choice(list(reviews_pool.keys()))
            comment = random.choice(reviews_pool[rating])
            
            # Create review
            review = Review.objects.create(
                product=product,
                user=user,
                rating=rating,
                comment=comment
            )
            
            # Set a random creation date in the last 15 days to make it look realistic
            days_ago = random.randint(1, 15)
            hours_ago = random.randint(1, 23)
            review.created_at = now - timedelta(days=days_ago, hours=hours_ago)
            review.save(update_fields=['created_at'])
            
            print(f" - Created Review: Rating {rating} by {user.username}. Comment: '{comment[:50]}...'")
            total_reviews_created += 1
            
    print(f"\nSuccessfully seeded {total_reviews_created} reviews/ratings in total!")

if __name__ == "__main__":
    seed_reviews()
