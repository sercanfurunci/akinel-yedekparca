using Akinel.Domain.Entities;
using Akinel.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Akinel.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(AkinelDbContext context)
    {
        await context.Database.MigrateAsync();

        // Business Settings — always seed independently
        if (!await context.BusinessSettings.AnyAsync())
        {
            var bizId = Guid.NewGuid();
            var biz = new BusinessSettings
            {
                Id = bizId,
                CompanyName = "Akinel Yedek Parça",
                ShortDescription = "Otomotiv yedek parçalarını araç, OEM numarası ve parça bilgisine göre kolayca bulun.",
                Description = "AKN MOTORS Car Service hizmet noktasının online yedek parça platformu. Araç seçimi veya OEM numarasıyla uyumlu parçaları kolayca bulun ve sipariş verin.",
                Phone = "+90 533 140 56 49",
                WhatsApp = "905331405649",
                Email = "info@aknmotors.com.tr",
                Address = "Nenehatun, Fatih Cd. No:81",
                District = "Darıca",
                City = "Kocaeli",
                Country = "Türkiye",
                PostalCode = "41700",
                GoogleMapsUrl = "https://maps.google.com/?q=Nenehatun+Fatih+Caddesi+No+81+41700+Darica+Kocaeli+Turkiye",
                GoogleMapsEmbedUrl = "https://maps.google.com/maps?q=Nenehatun+Fatih+Caddesi+No+81+41700+Darica+Kocaeli&output=embed&hl=tr",
                WebsiteUrl = "https://aknmotors.com.tr",
            };
            context.BusinessSettings.Add(biz);
            await context.SaveChangesAsync();

            context.BusinessWorkingHours.AddRange(
                new BusinessWorkingHour { BusinessSettingsId = bizId, DayOfWeek = 0, IsOpen = false },
                new BusinessWorkingHour { BusinessSettingsId = bizId, DayOfWeek = 1, IsOpen = true, OpenTime = "09:00", CloseTime = "19:00" },
                new BusinessWorkingHour { BusinessSettingsId = bizId, DayOfWeek = 2, IsOpen = true, OpenTime = "09:00", CloseTime = "19:00" },
                new BusinessWorkingHour { BusinessSettingsId = bizId, DayOfWeek = 3, IsOpen = true, OpenTime = "09:00", CloseTime = "19:00" },
                new BusinessWorkingHour { BusinessSettingsId = bizId, DayOfWeek = 4, IsOpen = true, OpenTime = "09:00", CloseTime = "19:00" },
                new BusinessWorkingHour { BusinessSettingsId = bizId, DayOfWeek = 5, IsOpen = true, OpenTime = "09:00", CloseTime = "19:00" },
                new BusinessWorkingHour { BusinessSettingsId = bizId, DayOfWeek = 6, IsOpen = true, OpenTime = "09:00", CloseTime = "19:00" }
            );
            await context.SaveChangesAsync();
        }

        if (await context.Brands.AnyAsync()) return;

        var brands = new List<Brand>
        {
            new() { Name = "Bosch", Slug = "bosch" },
            new() { Name = "Valeo", Slug = "valeo" },
            new() { Name = "SKF", Slug = "skf" },
            new() { Name = "Delphi", Slug = "delphi" },
            new() { Name = "TRW", Slug = "trw" },
        };
        context.Brands.AddRange(brands);

        var catBrakes = new Category { Name = "Brakes", Slug = "brakes" };
        var catClutch = new Category { Name = "Clutch", Slug = "clutch" };
        var catFilters = new Category { Name = "Filters", Slug = "filters" };
        var catSuspension = new Category { Name = "Suspension", Slug = "suspension" };
        var catElectrical = new Category { Name = "Electrical", Slug = "electrical" };
        var catCooling = new Category { Name = "Cooling", Slug = "cooling" };
        context.Categories.AddRange(catBrakes, catClutch, catFilters, catSuspension, catElectrical, catCooling);

        var subBrakePads = new Category { Name = "Brake Pads", Slug = "brake-pads", ParentCategory = catBrakes };
        var subBrakeDiscs = new Category { Name = "Brake Discs", Slug = "brake-discs", ParentCategory = catBrakes };
        var subAbsSensors = new Category { Name = "ABS Sensors", Slug = "abs-sensors", ParentCategory = catBrakes };
        var subOilFilter = new Category { Name = "Oil Filters", Slug = "oil-filters", ParentCategory = catFilters };
        var subAirFilter = new Category { Name = "Air Filters", Slug = "air-filters", ParentCategory = catFilters };
        context.Categories.AddRange(subBrakePads, subBrakeDiscs, subAbsSensors, subOilFilter, subAirFilter);

        // Vehicles
        var bmw = new VehicleMake { Name = "BMW", Slug = "bmw" };
        var vw = new VehicleMake { Name = "Volkswagen", Slug = "volkswagen" };
        var ford = new VehicleMake { Name = "Ford", Slug = "ford" };
        var renault = new VehicleMake { Name = "Renault", Slug = "renault" };
        context.VehicleMakes.AddRange(bmw, vw, ford, renault);

        var bmw1Series = new VehicleModel { Name = "1 Series", Slug = "bmw-1-series", VehicleMake = bmw };
        var vwGolf = new VehicleModel { Name = "Golf", Slug = "vw-golf", VehicleMake = vw };
        var fordFocus = new VehicleModel { Name = "Focus", Slug = "ford-focus", VehicleMake = ford };
        var renaultMegane = new VehicleModel { Name = "Megane", Slug = "renault-megane", VehicleMake = renault };
        context.VehicleModels.AddRange(bmw1Series, vwGolf, fordFocus, renaultMegane);

        var bmwF20 = new VehicleGeneration { Name = "F20", Slug = "bmw-1-series-f20", VehicleModel = bmw1Series, YearFrom = 2011, YearTo = 2019, BodyType = "Hatchback" };
        var vwGolf7 = new VehicleGeneration { Name = "Mk7", Slug = "vw-golf-mk7", VehicleModel = vwGolf, YearFrom = 2012, YearTo = 2020, BodyType = "Hatchback" };
        var fordFocusMk3 = new VehicleGeneration { Name = "Mk3", Slug = "ford-focus-mk3", VehicleModel = fordFocus, YearFrom = 2011, YearTo = 2018, BodyType = "Hatchback" };
        var renaultMegane3 = new VehicleGeneration { Name = "Mk3", Slug = "renault-megane-mk3", VehicleModel = renaultMegane, YearFrom = 2008, YearTo = 2015, BodyType = "Hatchback" };
        context.VehicleGenerations.AddRange(bmwF20, vwGolf7, fordFocusMk3, renaultMegane3);

        var bmwF20_116d = new VehicleEngine { Name = "116d 1.5d 85kW", VehicleGeneration = bmwF20, Displacement = "1.5", FuelType = "Diesel", PowerKw = 85, PowerHp = 116, YearFrom = 2015, YearTo = 2019, EngineCode = "B37" };
        var vwGolf7_20tdi = new VehicleEngine { Name = "2.0 TDI 110kW", VehicleGeneration = vwGolf7, Displacement = "2.0", FuelType = "Diesel", PowerKw = 110, PowerHp = 150, YearFrom = 2013, YearTo = 2020, EngineCode = "CRBC" };
        var fordFocusMk3_15tdci = new VehicleEngine { Name = "1.5 TDCi 88kW", VehicleGeneration = fordFocusMk3, Displacement = "1.5", FuelType = "Diesel", PowerKw = 88, PowerHp = 120, YearFrom = 2014, YearTo = 2018, EngineCode = "XWDB" };
        var renaultMegane3_15dci = new VehicleEngine { Name = "1.5 dCi 81kW", VehicleGeneration = renaultMegane3, Displacement = "1.5", FuelType = "Diesel", PowerKw = 81, PowerHp = 110, YearFrom = 2009, YearTo = 2015, EngineCode = "K9K" };
        context.VehicleEngines.AddRange(bmwF20_116d, vwGolf7_20tdi, fordFocusMk3_15tdci, renaultMegane3_15dci);

        await context.SaveChangesAsync();

        // Products
        var bosch = brands[0];
        var trw = brands[4];

        var p1 = new Product { Name = "Rear Brake Pad Set", Slug = "rear-brake-pad-set-bosch", BrandId = bosch.Id, CategoryId = subBrakePads.Id, PartNumber = "0986424706", Price = 850.00m };
        var p2 = new Product { Name = "Front Brake Disc", Slug = "front-brake-disc-trw", BrandId = trw.Id, CategoryId = subBrakeDiscs.Id, PartNumber = "DF4101", Price = 1200.00m };
        var p3 = new Product { Name = "Oil Filter", Slug = "oil-filter-bosch", BrandId = bosch.Id, CategoryId = subOilFilter.Id, PartNumber = "P3370", Price = 120.00m };
        context.Products.AddRange(p1, p2, p3);
        await context.SaveChangesAsync();

        context.Stocks.AddRange(
            new Stock { ProductId = p1.Id, Quantity = 50, ReservedQuantity = 0, MinimumStockLevel = 5 },
            new Stock { ProductId = p2.Id, Quantity = 30, ReservedQuantity = 2, MinimumStockLevel = 5 },
            new Stock { ProductId = p3.Id, Quantity = 100, ReservedQuantity = 0, MinimumStockLevel = 10 }
        );

        context.ProductVehicleCompatibilities.AddRange(
            new ProductVehicleCompatibility { ProductId = p1.Id, VehicleEngineId = bmwF20_116d.Id },
            new ProductVehicleCompatibility { ProductId = p1.Id, VehicleEngineId = vwGolf7_20tdi.Id },
            new ProductVehicleCompatibility { ProductId = p2.Id, VehicleEngineId = bmwF20_116d.Id },
            new ProductVehicleCompatibility { ProductId = p3.Id, VehicleEngineId = bmwF20_116d.Id },
            new ProductVehicleCompatibility { ProductId = p3.Id, VehicleEngineId = fordFocusMk3_15tdci.Id },
            new ProductVehicleCompatibility { ProductId = p3.Id, VehicleEngineId = renaultMegane3_15dci.Id }
        );

        var oem1 = new OemNumber { Number = "0986424706", NormalizedNumber = "0986424706", Manufacturer = "Bosch" };
        context.OemNumbers.Add(oem1);
        await context.SaveChangesAsync();
        context.ProductOemNumbers.Add(new ProductOemNumber { ProductId = p1.Id, OemNumberId = oem1.Id });

        // Admin user
        if (!await context.Users.AnyAsync())
        {
            context.Users.Add(new User
            {
                Email = "admin@akinel.com",
                NormalizedEmail = "ADMIN@AKINEL.COM",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                FirstName = "Admin",
                LastName = "User",
                Role = UserRole.Admin,
                IsActive = true
            });
        }

        await context.SaveChangesAsync();
    }
}
