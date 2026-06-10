using Microsoft.EntityFrameworkCore;
using Minimarket.Infrastructure.Data;
using System;

namespace Minimarket.Tests
{
    public static class TestDbContextFactory
    {
        public static DbMinimarketContext CreateInMemoryContext(string dbName = null)
        {
            var options = new DbContextOptionsBuilder<DbMinimarketContext>()
                .UseInMemoryDatabase(databaseName: dbName ?? Guid.NewGuid().ToString())
                .Options;

            return new DbMinimarketContext(options);
        }

        public static DbMinimarketContext CreateSqliteContext()
        {
            var options = new DbContextOptionsBuilder<DbMinimarketContext>()
                .UseSqlite("DataSource=:memory:")
                .Options;

            var context = new DbMinimarketContext(options);
            context.Database.OpenConnection();
            context.Database.EnsureCreated();
            return context;
        }
    }
}
