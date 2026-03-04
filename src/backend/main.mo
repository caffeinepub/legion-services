import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";



actor {
  type ServiceCategory = {
    #discordServices;
    #bloxFruits;
  };

  type PaymentType = {
    #money;
    #inGameFruits;
    #crypto;
  };

  type OrderStatus = {
    #pending;
    #inProgress;
    #completed;
    #cancelled;
  };

  type Service = {
    id : Nat;
    name : Text;
    category : ServiceCategory;
    description : Text;
    priceUSD : Float;
    acceptedPayments : [PaymentType];
    available : Bool;
  };

  module Service {
    public func compare(service1 : Service, service2 : Service) : Order.Order {
      Nat.compare(service1.id, service2.id);
    };
  };

  type Order = {
    id : Nat;
    serviceId : Nat;
    quantity : Nat;
    paymentMethod : PaymentType;
    contactInfo : Text;
    notes : Text;
    status : OrderStatus;
  };

  module OrderCompare {
    public func compare(order1 : Order, order2 : Order) : Order.Order {
      Nat.compare(order1.id, order2.id);
    };
  };

  stable var nextOrderId = 1;

  let services = Map.empty<Nat, Service>();
  let orders = Map.empty<Nat, Order>();

  let initialServicesData = [
    // Discord Services
    {
      id = 1;
      name = "Discord Nitro 1 Month";
      category = #discordServices;
      description = "Get 1 month of Discord Nitro subscription.";
      priceUSD = 5.0;
      acceptedPayments = [#money, #crypto];
      available = true;
    },
    {
      id = 2;
      name = "Discord Nitro 3 Months";
      category = #discordServices;
      description = "Get 3 months of Discord Nitro subscription.";
      priceUSD = 13.5;
      acceptedPayments = [#money, #crypto];
      available = true;
    },
    {
      id = 3;
      name = "Server Boosts x1";
      category = #discordServices;
      description = "Get 1 Discord server boost.";
      priceUSD = 2.5;
      acceptedPayments = [#money, #crypto];
      available = true;
    },
    {
      id = 4;
      name = "Server Boosts x5";
      category = #discordServices;
      description = "Get 5 Discord server boosts.";
      priceUSD = 12.0;
      acceptedPayments = [#money, #crypto];
      available = true;
    },
    {
      id = 5;
      name = "Server Boosts x10";
      category = #discordServices;
      description = "Get 10 Discord server boosts.";
      priceUSD = 23.0;
      acceptedPayments = [#money, #crypto];
      available = true;
    },
    {
      id = 6;
      name = "Server Boosts x30";
      category = #discordServices;
      description = "Get 30 Discord server boosts.";
      priceUSD = 65.0;
      acceptedPayments = [#money, #crypto];
      available = true;
    },
    {
      id = 7;
      name = "Discord Decorations";
      category = #discordServices;
      description = "Custom Discord decorations for your profile or server.";
      priceUSD = 3.0;
      acceptedPayments = [#money, #crypto];
      available = true;
    },
    // Blox Fruits Services
    {
      id = 8;
      name = "Fruit Raid";
      category = #bloxFruits;
      description = "Complete a raid with your chosen fruit.";
      priceUSD = 8.0;
      acceptedPayments = [#money, #inGameFruits];
      available = true;
    },
    {
      id = 9;
      name = "Sea Event";
      category = #bloxFruits;
      description = "Get help completing a sea event.";
      priceUSD = 4.0;
      acceptedPayments = [#money, #inGameFruits];
      available = true;
    },
    {
      id = 10;
      name = "V4 Awakening";
      category = #bloxFruits;
      description = "Assistance with V4 awakening process.";
      priceUSD = 15.0;
      acceptedPayments = [#money, #inGameFruits];
      available = true;
    },
  ];

  // Initialize services map with initial data
  for (service in initialServicesData.values()) {
    services.add(service.id, service);
  };

  public query ({ caller }) func getAllServices() : async [Service] {
    services.values().toArray().sort();
  };

  public query ({ caller }) func getService(id : Nat) : async Service {
    switch (services.get(id)) {
      case (null) { Runtime.trap("Service not found") };
      case (?service) { service };
    };
  };

  public shared ({ caller }) func submitOrder(
    serviceId : Nat,
    quantity : Nat,
    paymentMethod : PaymentType,
    contactInfo : Text,
    notes : Text,
  ) : async Nat {
    let order : Order = {
      id = nextOrderId;
      serviceId;
      quantity;
      paymentMethod;
      contactInfo;
      notes;
      status = #pending;
    };
    orders.add(nextOrderId, order);
    nextOrderId += 1;
    order.id;
  };

  public query ({ caller }) func getOrder(id : Nat) : async Order {
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    orders.values().toArray().sort();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, newStatus : OrderStatus) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder : Order = {
          id = order.id;
          serviceId = order.serviceId;
          quantity = order.quantity;
          paymentMethod = order.paymentMethod;
          contactInfo = order.contactInfo;
          notes = order.notes;
          status = newStatus;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getServicesByCategory(category : ServiceCategory) : async [Service] {
    services.values().toArray().sort().filter(
      func(service) {
        service.category == category;
      }
    );
  };

  public query ({ caller }) func getAvailableServices() : async [Service] {
    services.values().toArray().sort().filter(func(s) { s.available });
  };

  public query ({ caller }) func getOrdersByStatus(status : OrderStatus) : async [Order] {
    orders.values().toArray().sort().filter(func(order) { order.status == status });
  };
};
