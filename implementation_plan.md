# Add Product Variants (Size + Weight + Color) System

## Understanding

Currently, a product has a single size, weight, dimensions (L×B×H), and stock. The user wants a **variant system** where:

- A product can have **multiple variants**
- Each variant is a combination of **Size + Weight + Color**
- Each variant has its **own dimensions** (Length, Breadth, Height)
- Each variant has its **own stock** (Small has different stock, Medium has different stock, etc.)
- Each variant can have its **own price** (optional — defaults to product base price)

**Example:** A car seat cover product:

| Size | Weight | Color | L×B×H | Stock | Price |
|------|--------|-------|-------|-------|-------|
| Small | 500g | Red | 30×20×5 | 25 | ₹1,200 |
| Small | 500g | Black | 30×20×5 | 40 | ₹1,200 |
| Medium | 750g | Red | 40×25×6 | 15 | ₹1,500 |
| Medium | 750g | Blue | 40×25×6 | 20 | ₹1,500 |
| Large | 1kg | Black | 50×30×7 | 10 | ₹1,800 |

## User Review Required

> [!IMPORTANT]
> **Existing fields on Product model**: The current `size`, `weight`, `length`, `breadth`, `height`, `stock` fields on `Product` will be kept as **base/default values** (used for shipping calculations). The new `ProductVariant` model stores the customer-facing variants. Products without variants will still work using the base fields.

> [!IMPORTANT]
> **Not all fields required per variant**: A variant can have just a size, or just a color, or just a weight, or any combination. The vendor fills in only what applies to their product.

## Proposed Changes

### Backend — New ProductVariant Model

#### [NEW] `ProductVariant` model in [models.py](file:///c:/Users/soorya/Desktop/caraccessories/ecommerce-car-accessories/backend/ecommerce/products/models.py)

```python
class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    
    # Variant attributes (all optional — vendor fills what applies)
    size = models.CharField(max_length=50, blank=True, null=True)           # "Small", "Medium", "Large", "X-Large"
    weight_value = models.CharField(max_length=100, blank=True, null=True)  # "250g", "500g", "1kg"
    color_name = models.CharField(max_length=100, blank=True, null=True)    # "Red", "Matte Black"
    color_code = models.CharField(max_length=7, blank=True, null=True)      # "#FF0000"
    
    # Dimensions for this variant
    length = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    breadth = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    height = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Price & Stock
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # overrides product price
    stock = models.PositiveIntegerField(default=0)
    is_default = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        parts = [self.product.name]
        if self.size: parts.append(self.size)
        if self.weight_value: parts.append(self.weight_value)
        if self.color_name: parts.append(self.color_name)
        return " - ".join(parts)
```

---

### Backend — Serializers

#### [MODIFY] [serializers.py](file:///c:/Users/soorya/Desktop/caraccessories/ecommerce-car-accessories/backend/ecommerce/products/serializers.py)

- Add `ProductVariantSerializer` with all variant fields
- Add nested `variants` read field to `ProductSerializer`
- Accept `variants` JSON data during create/update

---

### Backend — Vendor Views

#### [MODIFY] [views.py](file:///c:/Users/soorya/Desktop/caraccessories/ecommerce-car-accessories/backend/ecommerce/vendors/views.py)

- Update `VendorProductViewSet.create()` to parse `variants` JSON from request and create `ProductVariant` entries
- Update `perform_update()` to handle variant updates (delete old → create new)

---

### Backend — Migration

#### [NEW] Migration file
- `python manage.py makemigrations products`
- `python manage.py migrate`

---

### Frontend — AddProduct

#### [MODIFY] [AddProduct.jsx](file:///c:/Users/soorya/Desktop/caraccessories/ecommerce-car-accessories/frontend/admin_vendor/src/pages/vendor/products/AddProduct.jsx)

Add a **"Product Variants"** section below the "Others" card:

- **"+ Add Variant"** button to add a new variant row
- Each variant row contains:
  - **Size** dropdown (Small / Medium / Large / X-Large) — optional
  - **Weight** text input (e.g. "500g") — optional
  - **Color Name** text input + **Color Picker** (hex) — optional
  - **Length, Breadth, Height** number inputs
  - **Price** number input (optional override)
  - **Stock** number input
  - **Remove** button (✕)
- All variants sent as `variants` JSON field in the form data

---

### Frontend — EditProduct

#### [MODIFY] [EditProduct.jsx](file:///c:/Users/soorya/Desktop/caraccessories/ecommerce-car-accessories/frontend/admin_vendor/src/pages/vendor/products/EditProduct.jsx)

- Same variant UI as AddProduct
- Pre-populate existing variants from `productDetails.variants`
- Handle add/remove/update on save

---

## Verification Plan

### Automated Tests
- `python manage.py makemigrations --check` — verify migration is generated
- `python manage.py migrate` — apply migration

### Manual Verification
- Add a product with multiple variants (e.g. Small-Red, Medium-Blue, Large-Black)
- Each variant should have independent stock, dimensions, and optional price
- Edit the product: add new variants, remove existing ones
- Verify API returns `variants` array in product response
