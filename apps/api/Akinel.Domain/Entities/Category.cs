using Akinel.Domain.Common;

namespace Akinel.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public Guid? ParentCategoryId { get; set; }
    public Category? ParentCategory { get; set; }
    public ICollection<Category> SubCategories { get; set; } = new List<Category>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; } = 0;
    public string? ImageUrl { get; set; }
    public bool IsHomepageFeatured { get; set; } = false;
    public string? Description { get; set; }
    public string? BannerImageUrl { get; set; }
}
