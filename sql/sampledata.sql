use reccentre3;

SELECT m.ID, m.MemberName, t.discount, f.Cost as AmountOwed, t.cost as FlatRate, (t.discount*f.Cost) as TrueCost FROM member m JOIN reservation 
    r ON m.ID = r.BookedBy JOIN facility f ON f.FacName = r.FacName JOIN membership t ON t.tier = m.MembershipTier ORDER BY m.ID;

select * from MemberCostInfo;
SELECT * FROM reservation WHERE BookedBy= 2005 ORDER BY StartTime DESC;

SELECT  m.ID, m.MemberName as M1Name, m2.ID, m2.MemberName as M2Name, Member1, Member2 FROM Memberfriendlist mf join member m ON mf.Member1 = m.ID  
    join member m2 ON mf.Member2 = m2.ID WHERE Member1 = 2005 OR member2 = 2005;

INSERT INTO Member values (NULL, 'Shaimaa Ali', '52 Kibdon Road, London', '4578452156', 'sali42@uwo.ca', 32, 'F', 1, (SELECT Cost FROM Membership WHERE Tier = 1));
UPDATE member set amount_owed = 2500 WHERE MemberName = 'Shaimaa Ali';

SELECT MemberName, Address, Age FROM Member WHERE Address LIKE '%London%' ORDER BY Age;

INSERT INTO Reservation VALUES('2021-12-08 14:00:00', 2012, 'Amit Chakma', '2021-12-08 18:00:00');
SELECT m.MemberName, m.ID, m.Age, m.Gender FROM Reservation join member m on reservation.BookedBy = m.ID WHERE m.Age < 30 ORDER BY m.Age;
