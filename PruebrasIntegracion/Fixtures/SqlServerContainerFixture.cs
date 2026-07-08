using Microsoft.EntityFrameworkCore;
using Minimarket.Infrastructure.Data;
using Testcontainers.MsSql;
using System;
using System.Threading.Tasks;
using Xunit;

namespace PruebrasIntegracion.Fixtures
{
    public class SqlServerContainerFixture : IAsyncLifetime
    {
        private MsSqlContainer _container;
        public DbMinimarketContext DbContext { get; private set; } = null!;

        public SqlServerContainerFixture()
        {
            _container = new MsSqlBuilder()
                .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
                .WithPassword("YourStrong@Password123")
                .WithCleanUp(true)
                .Build();
        }

        public async Task InitializeAsync()
        {
            await _container.StartAsync();
            var connectionString = _container.GetConnectionString();
            var options = new DbContextOptionsBuilder<DbMinimarketContext>()
                .UseSqlServer(connectionString)
                .Options;

            DbContext = new DbMinimarketContext(options);
            await DbContext.Database.EnsureCreatedAsync();
        }

        public async Task DisposeAsync()
        {
            if (DbContext != null)
            {
                await DbContext.DisposeAsync();
            }
            if (_container != null)
            {
                await _container.StopAsync();
            }
        }
    }
}
